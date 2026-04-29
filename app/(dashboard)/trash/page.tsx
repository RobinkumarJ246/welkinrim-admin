'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useProducts } from '@/hooks/useProducts';
import { useSeries } from '@/hooks/useSeries';
import type { SupabaseProduct } from '@/lib/products';

export default function TrashPage() {
  const { getDeleted, restore, remove: removeProduct } = useProducts();
  const { getDeleted: getDeletedSeries, restore: restoreSeries, remove: removeSeries } = useSeries();

  const [deletedProducts, setDeletedProducts] = useState<SupabaseProduct[]>([]);
  const [deletedSeries, setDeletedSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'series'>('products');

  useEffect(() => {
    loadDeleted();
  }, []);

  const loadDeleted = async () => {
    setLoading(true);
    const products = await getDeleted();
    const series = await getDeletedSeries();
    setDeletedProducts(products);
    setDeletedSeries(series);
    setLoading(false);
  };

  const handleRestoreProduct = async (id: string) => {
    const success = await restore(id);
    if (success) {
      await loadDeleted();
    }
  };

  const handleRestoreSeries = async (id: string) => {
    const success = await restoreSeries(id);
    if (success) {
      await loadDeleted();
    }
  };

  const permanentlyDeleteProduct = async (id: string) => {
    if (!confirm('Permanently delete this product? This CANNOT be undone!')) return;
    // Hard delete - actually remove from database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadDeleted();
    }
  };

  const permanentlyDeleteSeries = async (id: string) => {
    if (!confirm('Permanently delete this series? This CANNOT be undone!')) return;
    // Hard delete - actually remove from database
    const { error } = await supabase
      .from('series')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadDeleted();
    }
  };

  return (
    <div className="trash-page">
      <div className="trash-header">
        <div>
          <h1 className="page-title">Trash</h1>
          <p className="page-subtitle">Restore or permanently delete items</p>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products ({deletedProducts.length})
        </button>
        <button
          className={`tab ${activeTab === 'series' ? 'active' : ''}`}
          onClick={() => setActiveTab('series')}
        >
          Series ({deletedSeries.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="trash-content">
          {activeTab === 'products' && (
            <div className="items-list">
              {deletedProducts.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🗑️</div>
                  <h3>No deleted products</h3>
                  <p>Products moved to trash will appear here</p>
                </div>
              ) : (
                deletedProducts.map(product => (
                  <div key={product.id} className="trash-item">
                    <div className="item-info">
                      <h3>{product.name || product.model}</h3>
                      <p className="item-meta">
                        {product.seriesLabel || product.series?.toUpperCase()} · {product.tag}
                      </p>
                      <p className="item-date">
                        Deleted {product.deleted_at ? new Date(product.deleted_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleRestoreProduct(product.id)}
                      >
                        Restore
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => permanentlyDeleteProduct(product.id)}
                      >
                        Delete Forever
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'series' && (
            <div className="items-list">
              {deletedSeries.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🗑️</div>
                  <h3>No deleted series</h3>
                  <p>Series moved to trash will appear here</p>
                </div>
              ) : (
                deletedSeries.map(series => (
                  <div key={series.id} className="trash-item">
                    <div className="item-info">
                      <h3>{series.label}</h3>
                      <p className="item-meta">ID: {series.id}</p>
                      <p className="item-date">
                        Deleted {series.deleted_at ? new Date(series.deleted_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleRestoreSeries(series.id)}
                      >
                        Restore
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => permanentlyDeleteSeries(series.id)}
                      >
                        Delete Forever
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .trash-page {
          padding: 24px;
          max-width: 1200px;
        }

        .trash-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-family: var(--font-display);
          font-size: 28px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-ink-soft);
        }

        .tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--color-white-border);
          margin-bottom: 24px;
        }

        .tab {
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          color: var(--color-ink-soft);
          transition: all 150ms ease;
        }

        .tab:hover {
          color: var(--color-ink);
        }

        .tab.active {
          color: var(--color-gold);
          border-bottom-color: var(--color-gold);
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trash-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 6px;
        }

        .item-info h3 {
          font-family: var(--font-display);
          font-size: 16px;
          margin: 0 0 4px 0;
        }

        .item-meta {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--color-ink-soft);
          margin: 0 0 2px 0;
        }

        .item-date {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-ink-mid);
          margin: 0;
        }

        .item-actions {
          display: flex;
          gap: 8px;
        }

        .btn {
          padding: 8px 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .btn-secondary {
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          color: var(--color-ink);
        }

        .btn-secondary:hover {
          background: var(--color-white-grey);
        }

        .btn-danger {
          background: var(--color-error);
          border: 1px solid var(--color-error);
          color: white;
        }

        .btn-danger:hover {
          filter: brightness(0.9);
        }

        .empty {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .empty h3 {
          font-family: var(--font-display);
          font-size: 18px;
          margin: 0 0 8px 0;
        }

        .empty p {
          font-family: var(--font-body);
          color: var(--color-ink-soft);
          margin: 0;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: var(--color-ink-soft);
          font-family: var(--font-mono);
        }
      `}</style>
    </div>
  );
}