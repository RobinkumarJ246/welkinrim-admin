'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { initializeProducts } from '@/lib/storage';

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { products, refresh } = useProducts();

  useEffect(() => {
    initializeProducts();
    refresh();
    setIsLoaded(true);
  }, [refresh]);

  if (!isLoaded || !products) {
    return null;
  }

  const stats = {
    totalProducts: products.length || 0,
    motors: products.filter(p => p.category === 'motor').length || 0,
    escs: products.filter(p => p.category === 'esc').length || 0,
    ips: products.filter(p => p.category === 'ips').length || 0,
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to the Welkinrim admin console</p>
      </div>

      <StatsOverview stats={stats} />

      <div className="dashboard-content">
        <div className="card welcome-card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <a href="/products" className="quick-action-btn">
              <ProductsIcon />
              <span>Manage Products</span>
            </a>
            <button className="quick-action-btn" disabled>
              <OrdersIcon />
              <span>Orders (Coming Soon)</span>
            </button>
            <button className="quick-action-btn" disabled>
              <AnalyticsIcon />
              <span>Analytics (Coming Soon)</span>
            </button>
          </div>
        </div>

        <div className="card info-card">
          <div className="card-header">
            <h2 className="card-title">System Status</h2>
          </div>
          <div className="system-status">
            <div className="status-item">
              <span className="status-dot success"></span>
              <span className="status-label">Products Database</span>
              <span className="status-value">Connected</span>
            </div>
            <div className="status-item">
              <span className="status-dot success"></span>
              <span className="status-label">Authentication</span>
              <span className="status-value">Active</span>
            </div>
            <div className="status-item">
              <span className="status-dot warning"></span>
              <span className="status-label">Backend Sync</span>
              <span className="status-value">Mock Mode</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-page {
          padding: 24px;
          max-width: 1400px;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }

        .dashboard-title {
          font-family: var(--font-display);
          font-size: 28px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-ink);
          margin-bottom: 8px;
        }

        .dashboard-subtitle {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-ink-mid);
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        .card-title {
          font-family: var(--font-display);
          font-size: 16px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-ink);
        }

        .quick-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--color-white-warm);
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
          text-decoration: none;
          color: var(--color-ink);
          cursor: pointer;
          transition: all 200ms ease;
        }

        .quick-action-btn:hover:not(:disabled) {
          border-color: var(--color-gold);
          background: var(--color-gold-ghost);
        }

        .quick-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quick-action-btn svg {
          width: 20px;
          height: 20px;
          color: var(--color-gold);
        }

        .quick-action-btn span {
          font-family: var(--font-mono);
          font-size: 13px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .system-status {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-dot.success {
          background: var(--color-success);
        }

        .status-dot.warning {
          background: var(--color-warning);
        }

        .status-label {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--color-ink-mid);
          flex: 1;
        }

        .status-value {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink);
        }
      `}</style>
    </div>
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

function OrdersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M3 9h14M9 3v14" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 16V8M10 16V4M16 16V10" />
    </svg>
  );
}
