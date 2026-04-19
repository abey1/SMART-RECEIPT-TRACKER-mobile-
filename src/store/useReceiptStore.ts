import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Receipt } from '../types';

interface ReceiptState {
  receipts: Receipt[];
  addReceipt: (receipt: Receipt) => void;
  removeReceipt: (id: string) => void;
}

export const useReceiptStore = create<ReceiptState>()(
  persist(
    (set) => ({
      receipts: [],
      addReceipt: (receipt) =>
        set((s) => ({ receipts: [receipt, ...s.receipts] })),
      removeReceipt: (id) =>
        set((s) => ({ receipts: s.receipts.filter((r) => r.id !== id) })),
    }),
    {
      name: 'smart-receipt-tracker-receipts',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ receipts: state.receipts }),
    }
  )
);
