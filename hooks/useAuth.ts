'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import type { User } from '@supabase/supabase-js';
import type { Profile, PregnancyProfile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pregnancy, setPregnancy] = useState<PregnancyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);

        // Fetch active pregnancy
        const { data: pregnancyData } = await supabase
          .from('pregnancy_profile')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();
        setPregnancy(pregnancyData);
      }

      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setProfile(null);
          setPregnancy(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, pregnancy, loading, supabase };
}
