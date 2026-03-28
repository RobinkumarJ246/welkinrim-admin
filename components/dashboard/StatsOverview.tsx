'use client';

interface StatsOverviewProps {
  stats: {
    totalProducts: number;
    motors: number;
    escs: number;
    ips: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span className="stat-card-label">Total Products</span>
        <span className="stat-card-value">{stats.totalProducts}</span>
        <span className="stat-card-sub">Across all categories</span>
      </div>

      <div className="stat-card stat-accent">
        <span className="stat-card-label">Motors</span>
        <span className="stat-card-accent">{stats.motors}</span>
        <span className="stat-card-sub">Haemng & Maelard series</span>
      </div>

      <div className="stat-card stat-cool">
        <span className="stat-card-label">ESCs</span>
        <span className="stat-card-value stat-cool-accent">{stats.escs}</span>
        <span className="stat-card-sub">Electronic Speed Controllers</span>
      </div>

      <div className="stat-card stat-purple">
        <span className="stat-card-label">IPS Systems</span>
        <span className="stat-card-value stat-purple-accent">{stats.ips}</span>
        <span className="stat-card-sub">Integrated Power Systems</span>
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-card-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-ink-soft);
        }

        .stat-card-value {
          font-family: var(--font-display);
          font-size: 36px;
          color: var(--color-ink);
        }

        .stat-card-accent {
          font-family: var(--font-display);
          font-size: 36px;
          color: var(--color-gold);
        }

        .stat-cool-accent {
          color: var(--color-air);
        }

        .stat-purple-accent {
          color: var(--color-robotics);
        }

        .stat-card-sub {
          font-family: var(--font-body);
          font-size: 12px;
          color: var(--color-ink-mid);
        }

        .stat-accent {
          border-color: var(--color-gold-line);
        }

        .stat-cool {
          border-color: rgba(43, 127, 232, 0.2);
        }

        .stat-purple {
          border-color: rgba(123, 92, 212, 0.2);
        }
      `}</style>
    </div>
  );
}
