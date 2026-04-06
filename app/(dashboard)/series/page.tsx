'use client';

import { useState } from 'react';
import { useSeries } from '@/hooks/useSeries';
import type { Series } from '@/hooks/useSeries';

export default function SeriesPage() {
  const { series, loading, create, update, remove } = useSeries();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [formData, setFormData] = useState<Partial<Series>>({
    id: '',
    label: '',
    use_svg_logo: false,
    logo_src: '',
    accent: '#ffc812',
    text_on_accent: '#000',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const success = editingSeries
        ? await update(editingSeries.id, formData)
        : await create(formData as Series);

      if (success) {
        setIsFormOpen(false);
        setEditingSeries(null);
        setFormData({
          id: '',
          label: '',
          use_svg_logo: false,
          logo_src: '',
          accent: '#ffc812',
          text_on_accent: '#000',
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (s: Series) => {
    setEditingSeries(s);
    setFormData(s);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this series?')) {
      await remove(id);
    }
  };

  if (loading) {
    return <div className="loading">Loading series...</div>;
  }

  return (
    <div className="series-page">
      <div className="series-header">
        <div>
          <h1 className="page-title">Series Management</h1>
          <p className="page-subtitle">Configure product series and branding</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
          + Add Series
        </button>
      </div>

      <div className="series-grid">
        {series.map((s) => (
          <div key={s.id} className="series-card">
            <div className="series-card-header">
              <h3>{s.label}</h3>
              <div className="series-actions">
                <button className="btn-icon" onClick={() => handleEdit(s)}>
                  ✎
                </button>
                <button className="btn-icon btn-danger" onClick={() => handleDelete(s.id)}>
                  ×
                </button>
              </div>
            </div>
            <div className="series-card-body">
              <div className="series-info">
                <span className="info-label">ID:</span>
                <code>{s.id}</code>
              </div>
              <div className="series-info">
                <span className="info-label">Accent Color:</span>
                <div className="color-preview" style={{ background: s.accent }}>
                  {s.accent}
                </div>
              </div>
              <div className="series-info">
                <span className="info-label">Text Color:</span>
                <div className="color-preview" style={{ background: s.text_on_accent }}>
                  {s.text_on_accent}
                </div>
              </div>
              {s.use_svg_logo && s.logo_src && (
                <div className="series-info">
                  <span className="info-label">Logo:</span>
                  <span>{s.logo_src}</span>
                </div>
              )}
              {s.icon_url && (
                <div className="series-info">
                  <span className="info-label">Icon:</span>
                  <img src={s.icon_url} alt={s.label} className="series-icon-preview" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isFormOpen && (
        <div className="modal-overlay" onClick={() => setIsFormOpen(false)}>
          <div className="modal series-modal" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2 className="modal-title">{editingSeries ? 'Edit Series' : 'Add Series'}</h2>
                <button type="button" className="modal-close-btn" onClick={() => setIsFormOpen(false)}>
                  ×
                </button>
              </div>

              <div className="modal-body series-form">
                <div className="form-group">
                  <label className="label">Series ID *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    disabled={!!editingSeries}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Label *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Accent Color *</label>
                  <input
                    type="color"
                    className="input"
                    value={formData.accent}
                    onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Text on Accent *</label>
                  <input
                    type="color"
                    className="input"
                    value={formData.text_on_accent}
                    onChange={(e) => setFormData({ ...formData, text_on_accent: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.use_svg_logo}
                      onChange={(e) => setFormData({ ...formData, use_svg_logo: e.target.checked })}
                    />
                    Use SVG Logo
                  </label>
                </div>

                {formData.use_svg_logo && (
                  <div className="form-group">
                    <label className="label">Logo Source</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.logo_src}
                      onChange={(e) => setFormData({ ...formData, logo_src: e.target.value })}
                      placeholder="e.g., haemng.svg"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Icon URL</label>
                  <input
                    type="url"
                    className="input"
                    value={formData.icon_url || ''}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingSeries ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .series-page {
          padding: 24px;
          max-width: 1600px;
        }

        .series-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .page-title {
          font-family: var(--font-display);
          font-size: 28px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0 0 8px 0;
        }

        .page-subtitle {
          font-family: var(--font-mono);
          font-size: 13px;
          color: var(--color-ink-soft);
          margin: 0;
        }

        .series-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .series-card {
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 8px;
          overflow: hidden;
        }

        .series-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--color-white-warm);
          border-bottom: 1px solid var(--color-white-border);
        }

        .series-card-header h3 {
          font-family: var(--font-display);
          font-size: 16px;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .series-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-white-pure);
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
          cursor: pointer;
          transition: all 200ms ease;
          color: var(--color-ink);
          font-size: 16px;
        }

        .btn-icon:hover {
          background: var(--color-gold);
          border-color: var(--color-gold);
          color: var(--color-white-pure);
        }

        .btn-icon.btn-danger {
          color: var(--color-error);
        }

        .btn-icon.btn-danger:hover {
          background: var(--color-error);
          border-color: var(--color-error);
          color: var(--color-white-pure);
        }

        .btn-icon.btn-danger:hover {
          background: var(--color-error);
          border-color: var(--color-error);
        }

        .series-card-body {
          padding: 20px;
        }

        .series-info {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          font-family: var(--font-mono);
          font-size: 12px;
        }

        .info-label {
          font-weight: 600;
          color: var(--color-ink-soft);
          min-width: 100px;
        }

        .color-preview {
          padding: 4px 12px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 11px;
        }

        .series-icon-preview {
          max-width: 64px;
          max-height: 64px;
          border-radius: 4px;
        }

        .loading {
          padding: 40px;
          text-align: center;
          font-family: var(--font-mono);
          color: var(--color-ink-soft);
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
