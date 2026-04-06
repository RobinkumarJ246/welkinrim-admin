'use client';

import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div className="settings-sections">
        {/* Account Section */}
        <section className="settings-section">
          <h2 className="section-title">Account Information</h2>
          <div className="setting-item">
            <label className="setting-label">Email</label>
            <div className="setting-value">{user?.email || 'Not available'}</div>
          </div>
          <div className="setting-item">
            <label className="setting-label">User ID</label>
            <div className="setting-value">{user?.id || 'Not available'}</div>
          </div>
        </section>

        {/* Database Section */}
        <section className="settings-section">
          <h2 className="section-title">Database Connection</h2>
          <div className="setting-item">
            <label className="setting-label">Status</label>
            <div className="setting-value">
              <span className="status-badge connected">Connected to Supabase</span>
            </div>
          </div>
          <div className="setting-item">
            <label className="setting-label">Tables</label>
            <div className="setting-value">products, series</div>
          </div>
        </section>

        {/* Storage Section */}
        <section className="settings-section">
          <h2 className="section-title">Storage Buckets</h2>
          <div className="setting-item">
            <label className="setting-label">Product Images</label>
            <div className="setting-value">
              <span className="status-badge">product-images</span>
            </div>
          </div>
          <div className="setting-item">
            <label className="setting-label">Product Icons</label>
            <div className="setting-value">
              <span className="status-badge">product-icons</span>
            </div>
          </div>
          <div className="setting-note">
            ⚠️ If uploads fail, configure RLS policies in Supabase Dashboard. See STORAGE_SETUP.md
          </div>
        </section>

        {/* Actions Section */}
        <section className="settings-section">
          <h2 className="section-title">Actions</h2>
          <button className="btn btn-danger" onClick={handleLogout}>
            Sign Out
          </button>
        </section>
      </div>

      <style jsx>{`
        .settings-page {
          padding: 24px;
          max-width: 900px;
        }

        .settings-header {
          margin-bottom: 32px;
        }

        .page-title {
          font-family: var(--font-display);
          font-size: 28px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-ink);
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-ink-mid);
        }

        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .settings-section {
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 8px;
          padding: 24px;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 16px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0 0 20px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-white-border);
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .setting-item:last-child {
          margin-bottom: 0;
        }

        .setting-label {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink-soft);
        }

        .setting-value {
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--color-ink);
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          background: var(--color-white-grey);
          border-radius: 3px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.connected {
          background: #d4edda;
          color: #155724;
        }

        .setting-note {
          margin-top: 12px;
          padding: 12px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: #856404;
        }

        .btn {
          padding: 10px 20px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: all 150ms ease;
          border: 1px solid transparent;
        }

        .btn-danger {
          background: var(--color-error);
          border-color: var(--color-error);
          color: white;
        }

        .btn-danger:hover {
          filter: brightness(0.9);
        }
      `}</style>
    </div>
  );
}
