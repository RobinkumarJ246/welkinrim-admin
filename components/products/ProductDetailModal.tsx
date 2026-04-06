'use client';

import { SupabaseProduct } from '@/lib/products';
import type { SpecItem } from '@/lib/productUtils';

interface ProductDetailModalProps {
  product: SupabaseProduct;
  onClose: () => void;
  onEdit?: () => void;
}

export function ProductDetailModal({ product, onClose, onEdit }: ProductDetailModalProps) {
  const productData = (product as any).data || product;
  
  console.log('ProductDetailModal - product:', product);
  console.log('ProductDetailModal - productData:', productData);
  
  // Format date
  const formatDate = (date: string | undefined) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal product-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{product.model}</h2>
            <p className="modal-subtitle">{product.id}</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {/* Metadata Section */}
          <div className="detail-section">
            <h3 className="section-title">Metadata</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Category:</span>
                <span className="detail-value badge">{product.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Series:</span>
                <span className="detail-value">{product.series || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created:</span>
                <span className="detail-value mono">{formatDate(product.created_at)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated:</span>
                <span className="detail-value mono">{formatDate(product.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Images Section */}
          {(productData.thumbnailUrl || productData.iconUrl) && (
            <div className="detail-section">
              <h3 className="section-title">Images</h3>
              <div className="images-grid">
                {productData.thumbnailUrl && (
                  <div className="image-container">
                    <label>Thumbnail</label>
                    <img src={productData.thumbnailUrl} alt="Product thumbnail" />
                  </div>
                )}
                {productData.iconUrl && (
                  <div className="image-container small">
                    <label>Icon</label>
                    <img src={productData.iconUrl} alt="Product icon" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Key Specifications Section */}
          {productData.keySpecs && productData.keySpecs.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">Key Specifications</h3>
              <div className="spec-grid">
                {productData.keySpecs.map((spec: SpecItem, index: number) => (
                  <div key={index} className="spec-item">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Specifications Section */}
          {productData.allSpecs && productData.allSpecs.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">All Specifications</h3>
              <div className="spec-grid">
                {productData.allSpecs.map((spec: SpecItem, index: number) => (
                  <div key={index} className="spec-item">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Fields Section */}
          {productData.customFields && productData.customFields.length > 0 && (
            <div className="detail-section">
              <h3 className="section-title">Additional Fields</h3>
              <div className="spec-grid">
                {productData.customFields.map((field: any, index: number) => (
                  <div key={index} className="spec-item">
                    <span className="spec-label">{field.key}</span>
                    <span className="spec-value">{field.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {onEdit && (
            <button type="button" className="btn btn-primary" onClick={() => { onEdit(); onClose(); }}>
              Edit Product
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(14, 14, 15, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .product-detail-modal {
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          background: var(--color-white-pure);
          border-radius: 4px;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid var(--color-white-border);
        }

        .modal-title {
          font-family: var(--font-display);
          font-size: 20px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-ink);
          margin: 0;
        }

        .modal-subtitle {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--color-ink-soft);
          margin: 4px 0 0 0;
        }

        .modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--color-ink-soft);
          border-radius: 4px;
        }

        .modal-close:hover {
          background: var(--color-white-grey);
          color: var(--color-ink);
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--color-white-border);
          background: var(--color-white-warm);
        }

        .detail-section {
          margin-bottom: 32px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 14px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-ink);
          margin: 0 0 16px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--color-gold);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink-soft);
        }

        .detail-value {
          font-size: 14px;
          color: var(--color-ink);
        }

        .detail-value.mono {
          font-family: var(--font-mono);
          font-size: 13px;
        }

        .detail-value.badge {
          display: inline-block;
          padding: 4px 10px;
          background: var(--color-white-grey);
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          width: fit-content;
        }

        .images-grid {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .image-container {
          flex: 1;
          min-width: 200px;
          max-width: 400px;
        }

        .image-container.small {
          max-width: 150px;
        }

        .image-container label {
          display: block;
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--color-ink-soft);
          margin-bottom: 8px;
        }

        .image-container img {
          width: 100%;
          height: auto;
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
        }

        .spec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }

        .spec-item {
          padding: 12px;
          background: var(--color-white-warm);
          border: 1px solid var(--color-white-border);
          border-radius: 4px;
        }

        .spec-label {
          display: block;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-ink-soft);
          margin-bottom: 4px;
        }

        .spec-value {
          display: block;
          font-size: 15px;
          font-weight: 500;
          color: var(--color-ink);
        }
      `}</style>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4l12 12M16 4L4 16" />
    </svg>
  );
}
