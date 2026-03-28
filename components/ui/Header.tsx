'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button
            className="btn btn-ghost header-menu-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>
          {title && <h1 className="header-title">{title}</h1>}
        </div>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span className="user-name">{user?.name || 'User'}</span>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        >
          <Sidebar isOpen onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      <style jsx>{`
        .header {
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          height: var(--header-height);
          background-color: var(--color-white-pure);
          border-bottom: 1px solid var(--color-white-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 99;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-menu-btn {
          display: none;
          padding: 8px;
        }

        .header-title {
          font-family: var(--font-display);
          font-size: 18px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-ink);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 12px;
          background: var(--color-white-warm);
          border-radius: 6px;
          border: 1px solid var(--color-white-border);
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-gold);
          color: var(--color-ink);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 12px;
          font-weight: 600;
        }

        .user-name {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink);
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(14, 14, 15, 0.5);
          z-index: 101;
        }

        .sidebar-overlay .sidebar {
          transform: translateX(0);
        }

        @media (max-width: 768px) {
          .header {
            left: 0;
          }

          .header-menu-btn {
            display: flex;
          }

          .header-title {
            font-size: 16px;
          }

          .user-name {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5h14M3 10h14M3 15h14" />
    </svg>
  );
}
