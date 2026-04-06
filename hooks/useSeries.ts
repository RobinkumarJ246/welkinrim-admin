'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Series {
  id: string;
  label: string;
  use_svg_logo: boolean;
  logo_src?: string;
  accent: string;
  text_on_accent: string;
  icon_url?: string;
  created_at?: string;
  updated_at?: string;
}

export function useSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    const loadFromSupabase = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('is_deleted', false)
        .order('id', { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error('Error loading series from Supabase', error);
        setSeries([]);
        setLoading(false);
        return;
      }

      setSeries((data as Series[]) || []);
      setLoading(false);
    };

    void loadFromSupabase();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .eq('is_deleted', false)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error loading series from Supabase', error);
      setSeries([]);
      setLoading(false);
      return;
    }

    setSeries((data as Series[]) || []);
    setLoading(false);
  }, []);

  const getAll = useCallback((): Series[] => {
    return series;
  }, [series]);

  const getById = useCallback((id: string): Series | undefined => {
    return series.find(s => s.id === id);
  }, [series]);

  const create = useCallback(async (newSeries: Series): Promise<boolean> => {
    const { error } = await supabase.from('series').insert({
      id: newSeries.id,
      label: newSeries.label,
      use_svg_logo: newSeries.use_svg_logo,
      logo_src: newSeries.logo_src,
      accent: newSeries.accent,
      text_on_accent: newSeries.text_on_accent,
      icon_url: newSeries.icon_url,
    });

    if (error) {
      console.error('Error creating series', error);
      return false;
    }

    await refresh();
    return true;
  }, [refresh]);

  const update = useCallback(async (id: string, updates: Partial<Series>): Promise<boolean> => {
    const { error } = await supabase
      .from('series')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating series', error);
      return false;
    }

    await refresh();
    return true;
  }, [refresh]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    // Soft delete: mark as deleted instead of removing
    const { error } = await supabase
      .from('series')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Error deleting series', error);
      return false;
    }

    await refresh();
    return true;
  }, [refresh]);

  return {
    series,
    loading,
    getAll,
    getById,
    create,
    update,
    remove,
    refresh,
  };
}
