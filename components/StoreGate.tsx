import { checkPremiumFlags, PremiumSource } from '@/hooks/usePremiumFeatures';
import { useStore } from '@/hooks/useStore';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

interface StoreGateProps {
  children: React.ReactNode;
  onReady?: () => void;
}

/**
 * A component that ensures the store is initialized before rendering its children.
 * It calls `initStore`, waits for initialization to complete, and then renders the children.
 * Optionally triggers the `onReady` callback once the store is ready.
 */
const StoreGate: React.FC<StoreGateProps> = ({ children, onReady }) => {
  const { initStore, lockPremiumFeatures, unlockPremiumFeatures, restorePremiumSettings } =
    useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      const loadedStore = await initStore();

      if ((loadedStore.unlockedSource as PremiumSource) !== 'Key') {
        const check = await checkPremiumFlags();
        console.log('Premium flags checked: ', JSON.stringify(check));

        if (loadedStore.unlocked) {
          if (!check.access) {
            await restorePremiumSettings();
            await lockPremiumFeatures();
            console.log('Locked premium by event');
          }
        } else {
          if (check.access) {
            unlockPremiumFeatures('Event');
            console.log('Unlocked premium by event');
          }
        }
      }

      setReady(true);
      onReady?.();
    };
    run();
  }, [onReady]);

  if (!ready) return <View />;

  return <>{children}</>;
};

export default StoreGate;
