/**
 * Mock authentication utilities
 */

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'editor';
  avatar?: string;
}

const MOCK_USER: User = {
  id: '1',
  username: 'admin',
  name: 'Administrator',
  role: 'admin',
  avatar: undefined,
};

const MOCK_PASSWORD = 'admin123';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const auth = {
  login(username: string, password: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (username === MOCK_USER.username && password === MOCK_PASSWORD) {
          resolve(MOCK_USER);
        } else {
          resolve(null);
        }
      }, 500); // Simulate network delay
    });
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
