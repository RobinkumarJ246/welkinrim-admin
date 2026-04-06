'use client';

import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/context/ToastContext';
import type { Product } from '@/lib/products';

// Hook for product actions with toast notifications and async handling
export function useProductActions() {
  const { create, update, remove } = useProducts();
  const { success, error } = useToast();

  const createWithToast = async (product: Product): Promise<boolean> => {
    try {
      const result = await create(product);
      if (result) {
        success('Product created successfully');
        return true;
      } else {
        error('Failed to create product - ID may already exist');
        return false;
      }
    } catch (err) {
      console.error('Error creating product:', err);
      error('Failed to create product');
      return false;
    }
  };

  const updateWithToast = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      const result = await update(id, updates);
      if (result) {
        success('Product updated successfully');
        return true;
      } else {
        error('Failed to update product');
        return false;
      }
    } catch (err) {
      console.error('Error updating product:', err);
      error('Failed to update product');
      return false;
    }
  };

  const removeWithToast = async (id: string): Promise<boolean> => {
    try {
      const result = await remove(id);
      if (result) {
        success('Product deleted successfully');
        return true;
      } else {
        error('Failed to delete product');
        return false;
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      error('Failed to delete product');
      return false;
    }
  };

  return {
    create: createWithToast,
    update: updateWithToast,
    remove: removeWithToast,
  };
}
