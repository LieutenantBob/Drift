import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JournalEntry } from '../types';

interface ArchiveState {
  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  removeEntry: (id: string) => void;
  getEntry: (id: string) => JournalEntry | undefined;
}

export const useArchiveStore = create<ArchiveState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) =>
        set((state) => ({
          entries: [entry, ...state.entries],
        })),

      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),

      getEntry: (id) => get().entries.find((e) => e.id === id),
    }),
    {
      name: 'drift-archive',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
