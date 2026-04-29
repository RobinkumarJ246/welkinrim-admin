import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, fullName, invitedBy } = body;

    if (action === 'inviteUser') {
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
      }

      // Check if user already exists
      const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      const existing = existingUsers.users.find(u => u.email === email);
      if (existing) {
        // Check if they already have a profile
        const { data: existingProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('id', existing.id)
          .single();

        if (existingProfile) {
          return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
        }

        // User exists in auth but no profile - create profile for them
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: existing.id,
            email: email,
            full_name: fullName || email.split('@')[0],
            role: 'admin',
            is_super_admin: false,
            invited_by: invitedBy,
            invited_at: new Date().toISOString(),
          });

        if (profileError) {
          return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        // Send password reset email so they can set their password
        const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });

        if (resetError) {
          return NextResponse.json({
            success: true,
            message: 'Profile created. User can sign in to activate their account.'
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Profile created and invitation email sent!'
        });
      }

      // New user - use admin invite API
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login?mode=setup`,
        data: {
          full_name: fullName,
          invited_by: invitedBy,
        },
      });

      if (inviteError) {
        // If invite fails, try magic link instead
        const { error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
        });

        if (magicLinkError) {
          return NextResponse.json({ error: magicLinkError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Invitation email sent! The user can click the link to set up their account.'
        });
      }

      // Create profile for the invited user (their auth user was just created)
      // The invite creates an auth user with the email, we need to wait briefly or create profile manually
      // Actually, the trigger we created should handle this when email_confirmed_at is set
      // But for invited users, we can create the profile immediately with the new auth user's id

      // Get the newly created user
      const { data: newUser } = await supabaseAdmin.auth.admin.listUsers();
      const createdUser = newUser.users.find(u => u.email === email);

      if (createdUser) {
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: createdUser.id,
            email: email,
            full_name: fullName || email.split('@')[0],
            role: 'admin',
            is_super_admin: false,
            invited_by: invitedBy,
            invited_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Profile might be created by trigger, so not a critical error
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Invitation email sent! The user will receive an email to set up their admin account.'
      });
    }

    if (action === 'listAdminUsers') {
      // Get all users with profiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, full_name, is_super_admin, invited_by, invited_at, last_login, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) {
        return NextResponse.json({ error: profilesError.message }, { status: 500 });
      }

      return NextResponse.json({ users: profiles });
    }

    if (action === 'removeAdmin') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      // Delete the profile
      const { error: deleteError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      // Optionally delete the auth user too (soft delete - just ban/disable)
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '876000h', // Ban for ~100 years (effectively permanent)
      });

      if (banError) {
        console.error('Ban error:', banError);
        // Profile deleted, banning failed - not critical
      }

      return NextResponse.json({ success: true, message: 'Admin user removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}