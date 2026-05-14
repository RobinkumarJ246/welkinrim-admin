"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Product, SupabaseProduct, PerfRow, SpecItem } from '@/lib/products';
import { supabase } from '@/lib/supabaseClient';

interface ProductRow {
  id: string;
  category: string;
  series: string;
  model: string;
  data: Product;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  is_published: boolean;
}

export function useProducts() {
  const [products, setProducts] = useState<SupabaseProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFromSupabase = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading products from Supabase', error);
      setProducts([]);
      setLoading(false);
      return;
    }

    // Map Supabase rows to SupabaseProduct format
    const mapped = (data as ProductRow[]).map(row => ({
      ...row.data,
      id: row.id,
      category: row.category as any,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_published: row.is_published,
      is_deleted: row.is_deleted,
    }));

    setProducts(mapped);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadFromSupabase();
  }, [loadFromSupabase]);

  const refresh = useCallback(() => {
    void loadFromSupabase();
  }, [loadFromSupabase]);

  const getAll = useMemo((): SupabaseProduct[] => {
    return products;
  }, [products]);

  const getById = useCallback((id: string): SupabaseProduct | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const create = useCallback(async (product: Product, isDraft = false): Promise<boolean> => {
    // Determine category from series
    const category = getCategoryFromSeries(product.series);

    const { error } = await supabase.from('products').insert({
      id: product.id,
      category,
      series: product.series,
      model: product.model,
      data: product,
      is_published: !isDraft, // Draft if isDraft=true, otherwise published
    });

    if (error) {
      console.error('Error creating product', error);
      return false;
    }

    await loadFromSupabase();
    return true;
  }, [loadFromSupabase]);

  const update = useCallback(async (id: string, updates: Partial<Product>): Promise<boolean> => {
    const existing = products.find(p => p.id === id);
    if (!existing) return false;

    // Merge updates with existing data
    const merged = { ...existing, ...updates } as Product;
    const category = getCategoryFromSeries(merged.series);

    const { error } = await supabase
      .from('products')
      .update({
        category,
        series: merged.series,
        model: merged.model,
        data: merged,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating product', error);
      return false;
    }

    await loadFromSupabase();
    return true;
  }, [products, loadFromSupabase]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    // Soft delete: mark as deleted instead of removing
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting product', error);
      return false;
    }

    await loadFromSupabase();
    return true;
  }, [loadFromSupabase]);

  const restore = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('products')
      .update({ is_deleted: false, deleted_at: null })
      .eq('id', id);

    if (error) {
      console.error('Error restoring product', error);
      return false;
    }

    await loadFromSupabase();
    return true;
  }, [loadFromSupabase]);

  const unpublish = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('products')
      .update({ is_published: false })
      .eq('id', id);

    if (error) {
      console.error('Error unpublishing product', error);
      return false;
    }

    await loadFromSupabase();
    return true;
  }, [loadFromSupabase]);

  const publish = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('products')
      .update({ is_published: true })
      .eq('id', id);

    if (error) {
      console.error('Error publishing product', error);
      return false;
    }

    await loadFromSupabase();
    return true;
  }, [loadFromSupabase]);

  // Get products filtered by series/category
  const getBySeries = useCallback((series: string): SupabaseProduct[] => {
    if (series === 'all') return products;
    return products.filter(p => p.series === series);
  }, [products]);

  // Get drafts (unpublished products)
  const getDrafts = useCallback(async (): Promise<SupabaseProduct[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_published', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading drafts', error);
      return [];
    }

    return (data as ProductRow[]).map(row => ({
      ...row.data,
      id: row.id,
      category: row.category as any,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_published: row.is_published,
      is_deleted: row.is_deleted,
    }));
  }, []);

  // Get deleted products (trash)
  const getDeleted = useCallback(async (): Promise<SupabaseProduct[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false });

    if (error) {
      console.error('Error loading deleted products', error);
      return [];
    }

    return (data as ProductRow[]).map(row => ({
      ...row.data,
      id: row.id,
      category: row.category as any,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_published: row.is_published,
      is_deleted: row.is_deleted,
    }));
  }, []);

  return {
    products,
    loading,
    getAll,
    getById,
    create,
    update,
    remove,
    restore,
    unpublish,
    publish,
    getBySeries,
    getDrafts,
    getDeleted,
    refresh,
  };
}

// Helper to determine category from series
function getCategoryFromSeries(series: string): string {
  if (series === 'haemng' || series === 'maelard' || series === 'stroke' || series === 'vagans' || series === 'sciatic') return 'motor';
  if (series === 'esc') return 'esc';
  if (series === 'fc') return 'fc';
  if (series === 'ips') return 'ips';
  return 'other';
}