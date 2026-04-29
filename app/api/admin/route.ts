import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://welkinrim-admin.vercel.app';

// Invite expiration: 24 hours
const INVITE_EXPIRATION_HOURS = 24;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper to check and update expired invites
async function checkExpiredInvites() {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('invite_expires_at', new Date().toISOString());

  if (error) console.error('Error checking expired invites:', error);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, fullName, invitedBy, userId } = body;

    // Always check for expired invites on any request
    await checkExpiredInvites();

    if (action === 'inviteUser') {
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
      }

      // Security: Validate email format more strictly
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
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
          .select('id, status')
          .eq('id', existing.id)
          .single();

        if (existingProfile && existingProfile.status !== 'expired') {
          return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
        }

        // If expired, allow resend
        if (existingProfile?.status === 'expired') {
          // Resend invite
          const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${siteUrl}/login?mode=setup`,
            data: {
              full_name: fullName,
              invited_by: invitedBy,
            },
          });

          if (inviteError) {
            return NextResponse.json({ error: inviteError.message }, { status: 500 });
          }

          // Update profile with new expiration
          const expiresAt = new Date(Date.now() + INVITE_EXPIRATION_HOURS * 60 * 60 * 1000);
          await supabaseAdmin
            .from('user_profiles')
            .update({
              status: 'pending',
              invited_at: new Date().toISOString(),
              invite_expires_at: expiresAt.toISOString(),
            })
            .eq('id', existing.id);

          return NextResponse.json({
            success: true,
            message: 'Invitation resent! The user has 24 hours to accept.'
          });
        }

        // User exists in auth but no profile - create profile for them
        const expiresAt = new Date(Date.now() + INVITE_EXPIRATION_HOURS * 60 * 60 * 1000);
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
            invite_expires_at: expiresAt.toISOString(),
            status: existing.email_confirmed_at ? 'active' : 'pending',
          });

        if (profileError) {
          return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Profile created. User can sign in to activate their account.'
        });
      }

      // New user - use admin invite API with correct production URL
      const expiresAt = new Date(Date.now() + INVITE_EXPIRATION_HOURS * 60 * 60 * 1000);
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/login?mode=setup`,
        data: {
          full_name: fullName,
          invited_by: invitedBy,
        },
      });

      if (inviteError) {
        return NextResponse.json({ error: inviteError.message }, { status: 500 });
      }

      // Get the newly created user to create their profile
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
            invite_expires_at: expiresAt.toISOString(),
            status: 'pending',
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Invitation sent! The user has 24 hours to accept the invite.'
      });
    }

    if (action === 'resendInvite') {
      if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
      }

      // Get the user's email
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('email, status')
        .eq('id', userId)
        .single();

      if (!profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (profile.status !== 'expired' && profile.status !== 'pending') {
        return NextResponse.json({ error: 'Can only resend to pending or expired invites' }, { status: 400 });
      }

      // Resend invite
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(profile.email, {
        redirectTo: `${siteUrl}/login?mode=setup`,
      });

      if (inviteError) {
        return NextResponse.json({ error: inviteError.message }, { status: 500 });
      }

      // Update expiration
      const expiresAt = new Date(Date.now() + INVITE_EXPIRATION_HOURS * 60 * 60 * 1000);
      await supabaseAdmin
        .from('user_profiles')
        .update({
          status: 'pending',
          invited_at: new Date().toISOString(),
          invite_expires_at: expiresAt.toISOString(),
        })
        .eq('id', userId);

      return NextResponse.json({
        success: true,
        message: 'Invitation resent! The user has 24 hours to accept.'
      });
    }

    if (action === 'listAdminUsers') {
      // Get all auth users to check confirmation status
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 500 });
      }

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, full_name, is_super_admin, invited_by, invited_at, invite_expires_at, last_login, created_at, status')
        .order('created_at', { ascending: false });

      if (profilesError) {
        return NextResponse.json({ error: profilesError.message }, { status: 500 });
      }

      // Combine data - update status based on email_confirmed_at and expiration
      const enrichedUsers = profiles.map(profile => {
        const authUser = authUsers.users.find(u => u.id === profile.id);

        // Determine actual status
        let actualStatus = profile.status || 'pending';

        // If email confirmed, mark as active
        if (authUser?.email_confirmed_at) {
          actualStatus = 'active';
        }
        // If pending and expired, mark as expired
        else if (profile.status === 'pending' && profile.invite_expires_at) {
          const expiresAt = new Date(profile.invite_expires_at);
          if (expiresAt < new Date()) {
            actualStatus = 'expired';
          }
        }

        return {
          ...profile,
          status: actualStatus,
          last_login: authUser?.last_sign_in_at || profile.last_login,
        };
      });

      return NextResponse.json({ users: enrichedUsers });
    }

    if (action === 'removeAdmin') {
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

      // Ban the auth user (soft delete)
      const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '876000h',
      });

      if (banError) {
        console.error('Ban error:', banError);
      }

      return NextResponse.json({ success: true, message: 'Admin user removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}