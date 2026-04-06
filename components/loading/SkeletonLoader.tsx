'use client';

export function ProductTableSkeleton() {
  return (
    <div className="skeleton-table">
      <div className="skeleton-header">
        <div className="skeleton-cell skeleton-shimmer" style={{ width: '30%' }} />
        <div className="skeleton-cell skeleton-shimmer" style={{ width: '15%' }} />
        <div className="skeleton-cell skeleton-shimmer" style={{ width: '15%' }} />
        <div className="skeleton-cell skeleton-shimmer" style={{ width: '20%' }} />
        <div className="skeleton-cell skeleton-shimmer" style={{ width: '10%' }} />
        <div className="skeleton-cell skeleton-shimmer" style={{ width: '10%' }} />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '30%' }} />
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '15%' }} />
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '15%' }} />
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '20%' }} />
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '10%' }} />
          <div className="skeleton-cell skeleton-shimmer" style={{ width: '10%' }} />
        </div>
      ))}
      
      <style jsx>{`
        .skeleton-table {
          background: var(--color-white-pure);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .skeleton-header,
        .skeleton-row {
          display: flex;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--color-white-border);
        }
        
        .skeleton-header {
          background: var(--color-white-warm);
        }
        
        .skeleton-cell {
          height: 20px;
          background: var(--color-white-grey);
          border-radius: 4px;
        }
        
        .skeleton-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            90deg,
            var(--color-white-grey) 0%,
            var(--color-white-border) 50%,
            var(--color-white-grey) 100%
          );
          background-size: 200% 100%;
        }
        
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header skeleton-shimmer" />
      <div className="skeleton-card-value skeleton-shimmer" />
      <div className="skeleton-card-label skeleton-shimmer" />
      
      <style jsx>{`
        .skeleton-card {
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 8px;
          padding: 24px;
        }
        
        .skeleton-card-header {
          height: 24px;
          width: 40%;
          background: var(--color-white-grey);
          border-radius: 4px;
          margin-bottom: 16px;
        }
        
        .skeleton-card-value {
          height: 36px;
          width: 60%;
          background: var(--color-white-grey);
          border-radius: 4px;
          margin-bottom: 8px;
        }
        
        .skeleton-card-label {
          height: 16px;
          width: 50%;
          background: var(--color-white-grey);
          border-radius: 4px;
        }
        
        .skeleton-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            90deg,
            var(--color-white-grey) 0%,
            var(--color-white-border) 50%,
            var(--color-white-grey) 100%
          );
          background-size: 200% 100%;
        }
        
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
