'use client';

import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { ProductDetailModal } from '@/components/products/ProductDetailModal';
import { ProductTableSkeleton } from '@/components/loading/SkeletonLoader';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type CategoryFilter = 'all' | 'haemng' | 'maelard' | 'esc' | 'fc' | 'ips';
type SortKey = 'model' | 'series' | 'category' | 'weight';
type SortDir = 'asc' | 'desc';

export default function ProductsPage() {
  const { products, loading, remove } = useProducts();

  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('model');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<typeof products[0] | null>(null);
  const [viewingProduct, setViewingProduct] = useState<typeof products[0] | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<typeof products[0] | null>(null);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCategory !== 'all') {
      if (activeCategory === 'haemng') {
        result = result.filter(p => p.category === 'motor' && (p.series === 'haemng' || p.series === 'Haemng'));
      } else if (activeCategory === 'maelard') {
        result = result.filter(p => p.category === 'motor' && (p.series === 'maelard' || p.series === 'Maelard'));
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
          aVal = ((a as any).model || '').toLowerCase();
          bVal = ((b as any).model || '').toLowerCase();
          break;
        case 'series':
          aVal = ((a as any).series || '').toLowerCase();
          bVal = ((b as any).series || '').toLowerCase();
          break;
        case 'category':
          aVal = ((a as any).category || '').toLowerCase();
          bVal = ((b as any).category || '').toLowerCase();
          break;
        case 'weight':
          const aData = (a as any).data || a;
          const bData = (b as any).data || b;
          aVal = aData.weight || 0;
          bVal = bData.weight || 0;
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

  const handleView = (product: typeof products[0]) => {
    setViewingProduct(product);
  };

  const handleDelete = async () => {
    if (!deleteConfirmProduct) return;
    await remove(deleteConfirmProduct.id);
    setDeleteConfirmProduct(null);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const haemngCount = products.filter(p => p.category === 'motor' && (p.series === 'haemng' || p.series === 'Haemng')).length;
  const maelardCount = products.filter(p => p.category === 'motor' && (p.series === 'maelard' || p.series === 'Maelard')).length;
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
          haemng: haemngCount,
          maelard: maelardCount,
          esc: escsCount,
          fc: fcsCount,
          ips: ipsCount,
        }}
      />

      {loading ? (
        <ProductTableSkeleton />
      ) : (
        <ProductTable
          products={filteredProducts}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onEdit={handleEdit}
          onDelete={(id) => {
            const product = products.find(p => p.id === id);
            if (product) setDeleteConfirmProduct(product);
          }}
          onView={handleView}
        />
      )}

      {isFormOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {viewingProduct && (
        <ProductDetailModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={handleEdit}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirmProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirmProduct?.model}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmType="danger"
        requireTyping={deleteConfirmProduct?.id}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmProduct(null)}
      />

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
