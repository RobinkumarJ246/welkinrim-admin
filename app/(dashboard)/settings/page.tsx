'use client';

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your admin console preferences</p>
      </div>

      <div className="settings-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">General Settings</h2>
          </div>
          <div className="settings-section">
            <p className="settings-text">
              Settings functionality coming soon. This will include:
            </p>
            <ul className="settings-list">
              <li>User profile management</li>
              <li>Password change</li>
              <li>Notification preferences</li>
              <li>Data export/import</li>
              <li>API configuration</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">System Information</h2>
          </div>
          <div className="system-info">
            <div className="info-row">
              <span className="info-label">Version</span>
              <span className="info-value">1.0.0 (Mock Mode)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Storage</span>
              <span className="info-value">localStorage</span>
            </div>
            <div className="info-row">
              <span className="info-label">Backend Sync</span>
              <span className="info-value">Not configured</span>
            </div>
          </div>
        </div>
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

        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card-title {
          font-family: var(--font-display);
          font-size: 16px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-ink);
        }

        .settings-section {
          padding: 8px 0;
        }

        .settings-text {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-ink-mid);
          margin-bottom: 16px;
        }

        .settings-list {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--color-ink);
          padding-left: 20px;
          line-height: 2;
        }

        .system-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--color-white-border);
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-label {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink-soft);
        }

        .info-value {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--color-ink);
        }
      `}</style>
    </div>
  );
}
