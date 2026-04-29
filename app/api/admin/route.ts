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

      // Check if user already exists in auth
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(u => u.email === email);

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
          // Send magic link
          const { error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
          });

          if (magicLinkError) {
            return NextResponse.json({ error: magicLinkError.message }, { status: 500 });
          }

          // Update profile with new expiration
          const expiresAt = new Date(Date.now() + INVITE_EXPIRATION_HOURS * 60 * 60 * 1000);
          await supabaseAdmin
            .from('user_profiles')
            .update({
              status: 'pending',
              invited_at: new Date().toISOString(),
              invite_expires_at: expiresAt.toISOString(),
              invited_by: invitedBy,
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

        // Send magic link if not confirmed
        if (!existing.email_confirmed_at) {
          await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
          });
        }

        return NextResponse.json({
          success: true,
          message: 'Profile created and invitation sent!'
        });
      }

      // New user - create auth user with admin API (this doesn't trigger our INSERT trigger anymore)
      // We use createUser which creates the user but doesn't auto-confirm
      const expiresAt = new Date(Date.now() + INVITE_EXPIRATION_HOURS * 60 * 60 * 1000);

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: false, // Don't auto-confirm, user must click magic link
        user_metadata: {
          full_name: fullName,
          invited_by: invitedBy,
        },
      });

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      if (!newUser?.user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      // Create profile for the new user
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: newUser.user.id,
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
        // Try to delete the created auth user if profile fails
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }

      // Send magic link email
      const { error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
      });

      if (magicLinkError) {
        console.error('Magic link error:', magicLinkError);
        // User created but email failed - still return success
        return NextResponse.json({
          success: true,
          message: 'User created but email delivery failed. They can sign in directly.'
        });
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

      // Send magic link
      const { error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: profile.email,
      });

      if (magicLinkError) {
        return NextResponse.json({ error: magicLinkError.message }, { status: 500 });
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
        .select('id, email, full_name, role, is_super_admin, invited_by, invited_at, invite_expires_at, last_login, created_at, status')
        .order('created_at', { ascending: false });

      if (profilesError) {
        return NextResponse.json({ error: profilesError.message }, { status: 500 });
      }

      // Combine data
      const enrichedUsers = profiles.map(profile => {
        const authUser = authUsers?.users?.find(u => u.id === profile.id);

        // Determine actual status
        let actualStatus = profile.status || 'pending';

        // If email confirmed, mark as active
        if (authUser?.email_confirmed_at) {
          actualStatus = 'active';
        }
        // If pending and expired, mark as expired
        else if (profile.status === 'pending' && profile.invite_expires_at) {
          const expiresAtDate = new Date(profile.invite_expires_at);
          if (expiresAtDate < new Date()) {
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
      const { error: deleteProfileError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (deleteProfileError) {
        return NextResponse.json({ error: deleteProfileError.message }, { status: 500 });
      }

      // Actually delete the auth user (not just ban)
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteAuthError) {
        console.error('Auth delete error:', deleteAuthError);
        // Profile deleted but auth user remains - warn but don't fail
        return NextResponse.json({
          success: true,
          message: 'Profile deleted but auth user cleanup failed. User may still exist in auth system.'
        });
      }

      return NextResponse.json({ success: true, message: 'Admin user completely removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}