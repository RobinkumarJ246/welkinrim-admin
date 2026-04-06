'use client';

import { Product, SupabaseProduct, getDomainForProduct } from '@/lib/products';
import { getWeight } from '@/lib/productUtils';

interface ProductTableProps {
  products: SupabaseProduct[];
  sortKey: 'model' | 'series' | 'category' | 'weight';
  sortDir: 'asc' | 'desc';
  onSort: (key: 'model' | 'series' | 'category' | 'weight') => void;
  onEdit: (product: SupabaseProduct) => void;
  onDelete: (id: string) => void;
  onView?: (product: SupabaseProduct) => void;
}

export function ProductTable({
  products,
  sortKey,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  onView,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <EmptyIcon />
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '280px' }} onClick={() => onSort('model')}>
              Model {getSortIcon(sortKey, 'model', sortDir)}
            </th>
            <th onClick={() => onSort('series')}>
              Series {getSortIcon(sortKey, 'series', sortDir)}
            </th>
            <th onClick={() => onSort('category')}>
              Category {getSortIcon(sortKey, 'category', sortDir)}
            </th>
            <th onClick={() => onSort('weight')}>
              Weight {getSortIcon(sortKey, 'weight', sortDir)}
            </th>
            <th className="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const domain = getDomainForProduct(product);
            const weight = getWeight(product);
            const thumbnailUrl = (product as any).thumbnailUrl || (product.data as any)?.thumbnailUrl;

            return (
              <tr key={product.id} className="product-row" onClick={() => onView?.(product)} style={{ cursor: onView ? 'pointer' : 'default' }}>
                <td className="model-col">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {thumbnailUrl && (
                      <img 
                        src={thumbnailUrl} 
                        alt={product.model}
                        style={{ 
                          width: '56px', 
                          height: '42px', 
                          objectFit: 'cover', 
                          borderRadius: '4px',
                          border: '1px solid var(--color-white-border)'
                        }}
                      />
                    )}
                    <div className="model-cell">
                      <span className="model-name">{product.model}</span>
                      <span className="model-id">{product.id}</span>
                    </div>
                  </div>
                </td>
                <td>
                  {(product.series || ((product as any).data && 'series' in (product as any).data && (product as any).data.series)) ? (
                    <span className="series-badge">{product.series || (product as any).data.series}</span>
                  ) : <span>—</span>}
                </td>
                <td>
                  <DomainBadge domain={getDomainForProduct((product as any).data || product)} />
                </td>
                <td className="mono">
                  {(() => {
                    const weight = getWeight(product);
                    return weight !== '—' ? `${weight}g` : '—';
                  })()}
                </td>
                <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-ghost btn-sm action-btn"
                    onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm action-btn text-danger"
                    onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style jsx>{`
        .table-container {
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
          overflow: hidden;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: var(--color-ink-soft);
        }

        .empty-state svg {
          width: 48px;
          height: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-state p {
          font-family: var(--font-mono);
          font-size: 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .model-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .model-name {
          font-weight: 500;
          color: var(--color-ink);
        }

        .model-id {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-ink-soft);
        }

        .series-badge {
          display: inline-block;
          padding: 4px 10px;
          background: var(--color-white-grey);
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink);
        }

        .mono {
          font-family: var(--font-mono);
          font-size: 13px;
        }

        .actions-header {
          width: 100px;
          text-align: right;
        }

        .actions-cell {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
        }

        .action-btn {
          padding: 6px;
        }

        .action-btn svg {
          width: 16px;
          height: 16px;
        }

        .text-danger {
          color: var(--color-error);
        }

        .text-danger:hover {
          background: rgba(239, 68, 68, 0.06);
        }
      `}</style>
    </div>
  );
}

function getSortIcon(key: string, current: string, dir: 'asc' | 'desc') {
  if (key !== current) return '';
  return dir === 'asc' ? '▲' : '▼';
}

function DomainBadge({ domain }: { domain: string }) {
  const className = `badge badge-${domain}`;
  return (
    <span className={className}>
      {domain}
    </span>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11.5 2.5l2 2-7.5 7.5H4v-2l7.5-7.5z" />
      <path d="M8.5 4.5l2 2" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4h10M5 4V3h6v1M6 7v5M10 7v5M4 4v8a1 1 0 001 1h6a1 1 0 001-1V4" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="8" y="12" width="32" height="24" rx="2" />
      <path d="M16 24h16M24 20v8" />
    </svg>
  );
}
