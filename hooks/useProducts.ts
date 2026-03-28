'use client';

import { useState, useCallback } from 'react';
import { storage } from '@/lib/storage';
import type { Product } from '@/lib/products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(() => {
    return storage.get<Product[]>('products', []);
  });

  const refresh = useCallback(() => {
    const stored = storage.get<Product[]>('products', []);
    setProducts(stored);
  }, []);

  const getAll = useCallback((): Product[] => {
    return products;
  }, [products]);

  const getById = useCallback((id: string): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const create = useCallback((product: Product): boolean => {
    const existing = products.find(p => p.id === product.id);
    if (existing) {
      return false;
    }
    const updated = [...products, product];
    storage.set('products', updated);
    setProducts(updated);
    return true;
  }, [products]);

  const update = useCallback((id: string, updates: Partial<Product>): boolean => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    const updated = [...products];
    updated[index] = { ...updated[index], ...updates };
    storage.set('products', updated);
    setProducts(updated);
    return true;
  }, [products]);

  const remove = useCallback((id: string): boolean => {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    const updated = products.filter(p => p.id !== id);
    storage.set('products', updated);
    setProducts(updated);
    return true;
  }, [products]);

  const getByCategory = useCallback((category: string): Product[] => {
    if (category === 'all') return products;
    if (category === 'haemng') {
      return products.filter(p => p.category === 'motor' && p.series === 'Haemng');
    }
    if (category === 'maelard') {
      return products.filter(p => p.category === 'motor' && p.series === 'Maelard');
    }
    return products.filter(p => p.category === category);
  }, [products]);

  return {
    products,
    getAll,
    getById,
    create,
    update,
    remove,
    getByCategory,
    refresh,
  };
}
