import { useEffect } from 'react';

import { bootstrapEvacuationDatabase } from './bootstrap-evacuation-database';

export function useEvacuationDbBootstrap(): void {
  useEffect(() => {
    void bootstrapEvacuationDatabase().catch((error: unknown) => {
      console.error('[evacuation] Failed to bootstrap local database:', error);
    });
  }, []);
}
