'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import type { WeeklyInfo } from '@/types';

export function useWeeklyInfo(weekNumber: number | null) {
  const [weekInfo, setWeekInfo] = useState<WeeklyInfo | null>(null);
  const [allWeeks, setAllWeeks] = useState<WeeklyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchAll = async () => {
      const { data } = await supabase
        .from('weekly_info')
        .select('*')
        .order('week_number');
      
      if (data) {
        setAllWeeks(data);
        if (weekNumber) {
          const current = data.find(w => w.week_number === weekNumber);
          setWeekInfo(current || null);
        }
      }
      setLoading(false);
    };

    fetchAll();
  }, [weekNumber]);

  return { weekInfo, allWeeks, loading };
}
