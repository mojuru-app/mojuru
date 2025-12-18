import env from '@/env.json';
import axios from 'axios';
import { useMemo } from 'react';

import { useStore } from './useStore';

const { KEYS_API } = env;

export type PremiumSource = /*'Altstore' | */ 'Key' | 'Event' | null;

export function usePremiumFeatures(): {
  premiumFeatures: boolean;
  source: PremiumSource;
} {
  const { store } = useStore();

  const { premiumFeatures, source } = useMemo(() => {
    // if (APP_EDITION === 'premium') {
    //   return { premiumFeatures: true, source: 'Altstore' as const };
    // }

    if (store.unlocked === true) {
      return { premiumFeatures: true, source: store.unlockedSource as PremiumSource };
    }

    return { premiumFeatures: false, source: null };

  }, [store.unlocked, store.unlockedSource]);

  return { premiumFeatures, source };
}

interface PremiumCheckResult {
  access: boolean;
  message?: string;
}

export const checkPremiumFlags = async (): Promise<PremiumCheckResult> => {
  try {
    const response = await axios.get(KEYS_API, {
      headers: { 'Content-Type': 'application/json' },
    });

    const data = response.data;

    if (data && data.access === true && typeof data.from_flag === 'string') {
      return { access: true, message: data.from_flag };
    } else {
      return { access: false, message: undefined };
    }
  } catch (err) {
    console.log(err)
    return {
      access: false,
      message: 'Network error: could not check premium flags',
    };
  }
};
