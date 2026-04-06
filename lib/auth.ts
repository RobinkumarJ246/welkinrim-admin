/**
 * Supabase-backed authentication utilities
 *
 * We keep the same AuthContext API but delegate login to Supabase
 * using email/password. A lightweight user object is cached in
 * localStorage so AuthContext can restore session synchronously.
 */

import { supabase } from './supabaseClient';

export interface User {
  id: string;
  username: string; // email
  name: string;
  role: 'admin' | 'editor';
  avatar?: string;
}

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const auth = {
  async login(username: string, password: string): Promise<User | null> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    if (error || !data.user) {
      return null;
    }

    const user: User = {
      id: data.user.id,
      username: data.user.email ?? username,
      name: data.user.user_metadata?.full_name ?? (data.user.email ?? 'Admin User'),
      // For now, treat all authenticated users as admins
      role: 'admin',
      avatar: data.user.user_metadata?.avatar_url,
    };

    this.saveSession(user);
    return user;
  },

  saveSession(user: User): void {
    if (typeof window === 'undefined') return;
    try {
      const session = {
        user,
        expiresAt: Date.now() + SESSION_DURATION,
      };
      localStorage.setItem('welkinrim-admin-session', JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session', error);
    }
  },

  getSession(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionStr = localStorage.getItem('welkinrim-admin-session');
      if (!sessionStr) return null;

      const session = JSON.parse(sessionStr);
      if (session.expiresAt < Date.now()) {
        this.logout();
        return null;
      }
      return session.user;
    } catch (error) {
      console.error('Error getting session', error);
      return null;
    }
  },

  logout(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('welkinrim-admin-session');
    } catch (error) {
      console.error('Error clearing session', error);
    }
  },

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  },
};
