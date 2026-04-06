'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { SupabaseProduct } from '@/lib/products';
import { ProductFormModal } from '@/components/products/ProductFormModal';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<SupabaseProduct | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_published', false)
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false });

    setDrafts((data as any[])?.map(row => ({
      ...(row.data as any),
      id: row.id,
      data: row.data,
      series: row.series,
      model: row.model,
      category: row.category,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })) || []);

    setLoading(false);
  };

  const publishDraft = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .update({ is_published: true })
      .eq('id', id);

    if (!error) {
      await loadDrafts();
    }
  };

  const deleteDraft = async (id: string) => {
    if (!confirm('Delete this draft?')) return;

    const { error } = await supabase
      .from('products')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      await loadDrafts();
    }
  };

  return (
    <div className="drafts-page">
      <div className="drafts-header">
        <div>
          <h1 className="page-title">Drafts</h1>
          <p className="page-subtitle">Manage unpublished products</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading drafts...</div>
      ) : drafts.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📝</div>
          <h3>No drafts yet</h3>
          <p>Products saved as drafts will appear here</p>
        </div>
      ) : (
        <div className="drafts-grid">
          {drafts.map(draft => (
            <div key={draft.id} className="draft-card">
              <div className="draft-badge">Draft</div>
              <div className="draft-content">
                <h3>{draft.model}</h3>
                <p className="draft-meta">
                  {draft.category.toUpperCase()} · {draft.series}
                </p>
                <p className="draft-date">
                  Last edited {new Date(draft.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="draft-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingProduct(draft);
                    setIsFormOpen(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => publishDraft(draft.id)}
                >
                  Publish
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteDraft(draft.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsFormOpen(false);
            loadDrafts();
          }}
        />
      )}

      <style jsx>{`
        .drafts-page {
          padding: 24px;
          max-width: 1400px;
        }

        .drafts-header {
          margin-bottom: 32px;
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

        .drafts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .draft-card {
          position: relative;
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 8px;
          padding: 20px;
          transition: all 150ms ease;
        }

        .draft-card:hover {
          border-color: var(--color-gold);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .draft-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          padding: 4px 10px;
          background: var(--color-warning);
          color: white;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-radius: 3px;
        }

        .draft-content h3 {
          font-family: var(--font-display);
          font-size: 18px;
          margin: 0 0 8px 0;
          padding-right: 60px;
        }

        .draft-meta {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--color-ink-soft);
          margin: 0 0 4px 0;
        }

        .draft-date {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-ink-soft);
          margin: 0 0 16px 0;
        }

        .draft-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .btn {
          flex: 1;
          padding: 10px 16px;
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border-radius: 4px;
          cursor: pointer;
          transition: all 150ms ease;
          border: 1px solid transparent;
        }

        .btn-secondary {
          background: var(--color-white-pure);
          border-color: var(--color-white-border);
          color: var(--color-ink);
        }

        .btn-secondary:hover {
          background: var(--color-white-grey);
        }

        .btn-primary {
          background: var(--color-gold);
          border-color: var(--color-gold);
          color: var(--color-ink);
        }

        .btn-primary:hover {
          filter: brightness(1.1);
        }

        .btn-danger {
          background: transparent;
          border-color: var(--color-error);
          color: var(--color-error);
        }

        .btn-danger:hover {
          background: var(--color-error);
          color: white;
        }

        .empty {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty h3 {
          font-family: var(--font-display);
          font-size: 20px;
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
          font-family: var(--font-mono);
          color: var(--color-ink-soft);
        }
      `}</style>
    </div>
  );
}
