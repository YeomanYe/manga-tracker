import { CapacitorSQLiteAdapter } from '@manga/storage-adapter';
import { RootStore } from '@manga/stores';

export const rootStore = new RootStore(new CapacitorSQLiteAdapter());

export async function bootstrap(): Promise<void> {
  await rootStore.hydrate();
}
