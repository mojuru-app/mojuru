import { useStore } from '@/hooks/useStore';
import { Redirect } from 'expo-router';

export default function Root() {
  const { store } = useStore();

  if (store.landing) return <Redirect href={'/landing'} />;
  else return <Redirect href={'/(app)/(tabs)'} />;
}
