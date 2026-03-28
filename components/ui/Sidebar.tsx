'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Clear the session cookie
    document.cookie = 'welkinrim-session=; path=/; max-age=0; SameSite=Strict';
    logout();
  };

  const navItems = [
    { href: '/', label: 'Dashboard', icon: DashboardIcon },
    { href: '/products', label: 'Products', icon: ProductsIcon },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <Link href="/" className="sidebar-logo">
          <svg viewBox="0 0 40 40" width="32" height="32">
            <rect x="8" y="8" width="24" height="24" fill="#E8A800" rx="2" />
            <rect x="12" y="12" width="3" height="16" fill="#0E0E0F" />
            <rect x="18" y="12" width="3" height="16" fill="#0E0E0F" />
            <rect x="24" y="12" width="3" height="16" fill="#0E0E0F" />
          </svg>
          <span className="sidebar-logo-text">WELKINRIM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-link" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="7" height="7" rx="1" />
      <rect x="11" y="2" width="7" height="7" rx="1" />
      <rect x="2" y="11" width="7" height="7" rx="1" />
      <rect x="11" y="11" width="7" height="7" rx="1" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="16" height="5" rx="1" />
      <rect x="2" y="10" width="16" height="5" rx="1" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.657 4.343l-1.414 1.414M5.757 14.243l-1.414 1.414M15.657 15.657l-1.414-1.414M5.757 5.757L4.343 4.343" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 14l4-4-4-4M15 10H7" />
      <path d="M5 4v12" />
    </svg>
  );
}
