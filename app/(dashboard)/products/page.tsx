'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { isMotor, isESC, isFC, isIPS } from '@/lib/products';

type CategoryFilter = 'all' | 'haemng' | 'maelard' | 'esc' | 'fc' | 'ips';
type SortKey = 'model' | 'kv' | 'voltage' | 'peakThrust' | 'weight';
type SortDir = 'asc' | 'desc';

export default function ProductsPage() {
  const { products, remove } = useProducts();

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('model');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<typeof products[0] | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'all') {
      if (activeCategory === 'haemng') {
        result = result.filter(p => p.category === 'motor' && p.series === 'Haemng');
      } else if (activeCategory === 'maelard') {
        result = result.filter(p => p.category === 'motor' && p.series === 'Maelard');
      } else {
        result = result.filter(p => p.category === activeCategory);
      }
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.model.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        ('series' in p && p.series.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = 0;
      let bVal: string | number = 0;

      switch (sortKey) {
        case 'model':
          aVal = a.model.toLowerCase();
          bVal = b.model.toLowerCase();
          break;
        case 'kv':
          aVal = 'kv' in a ? a.kv : 0;
          bVal = 'kv' in b ? b.kv : 0;
          break;
        case 'voltage':
          aVal = 'voltage' in a ? String(a.voltage) : '';
          bVal = 'voltage' in b ? String(b.voltage) : '';
          break;
        case 'peakThrust':
          aVal = 'peakThrust' in a ? String(a.peakThrust) : '';
          bVal = 'peakThrust' in b ? String(b.peakThrust) : '';
          break;
        case 'weight':
          aVal = 'weight' in a ? a.weight : 0;
          bVal = 'weight' in b ? b.weight : 0;
          break;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, activeCategory, sortKey, sortDir, searchQuery]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleEdit = (product: typeof products[0]) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      remove(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const motorsCount = products.filter(p => p.category === 'motor').length;
  const escsCount = products.filter(p => p.category === 'esc').length;
  const fcsCount = products.filter(p => p.category === 'fc').length;
  const ipsCount = products.filter(p => p.category === 'ips').length;

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage motor catalogue and components</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <PlusIcon />
          Add Product
        </button>
      </div>

      <ProductFilters
        activeCategory={activeCategory}
        onCategoryChange={(cat) => setActiveCategory(cat as CategoryFilter)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stats={{
          all: products.length,
          haemng: motorsCount,
          maelard: products.filter(p => p.category === 'motor' && p.series === 'Maelard').length,
          esc: escsCount,
          fc: fcsCount,
          ips: ipsCount,
        }}
      />

      <ProductTable
        products={filteredProducts}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Confirm Delete</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .products-page {
          padding: 24px;
          max-width: 1600px;
        }

        .products-header {
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
          color: var(--color-ink);
          margin-bottom: 4px;
        }

        .page-subtitle {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-ink-mid);
        }

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

        .delete-modal {
          max-width: 420px;
        }

        .modal-title {
          font-family: var(--font-display);
          font-size: 18px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--color-ink);
        }

        .modal-body p {
          font-family: var(--font-body);
          font-size: 15px;
          color: var(--color-ink-mid);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3v12M3 9h12" />
    </svg>
  );
}
