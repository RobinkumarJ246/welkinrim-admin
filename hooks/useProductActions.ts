'use client';

import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/context/ToastContext';

export function ProductsPageWithToast() {
  // This is a wrapper to demonstrate toast integration
  // In production, you would integrate toasts directly into the ProductFormModal
  return null;
}

// Hook for product actions with toast notifications
export function useProductActions() {
  const { create, update, remove } = useProducts();
  const { success, error } = useToast();

  const createWithToast = (product: any) => {
    const result = create(product);
    if (result) {
      success('Product created successfully');
    } else {
      error('Failed to create product');
    }
    return result;
  };

  const updateWithToast = (id: string, updates: any) => {
    const result = update(id, updates);
    if (result) {
      success('Product updated successfully');
    } else {
      error('Failed to update product');
    }
    return result;
  };

  const removeWithToast = (id: string) => {
    const result = remove(id);
    if (result) {
      success('Product deleted successfully');
    } else {
      error('Failed to delete product');
    }
    return result;
  };

  return {
    create: createWithToast,
    update: updateWithToast,
    remove: removeWithToast,
  };
}
