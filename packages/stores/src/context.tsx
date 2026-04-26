import { type ReactNode, createContext, useContext } from 'react';
import type { RootStore } from './root-store';

const StoreContext = createContext<RootStore | null>(null);

export function StoreProvider({ store, children }: { store: RootStore; children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): RootStore {
  const s = useContext(StoreContext);
  if (!s) throw new Error('useStore must be used within <StoreProvider>');
  return s;
}
