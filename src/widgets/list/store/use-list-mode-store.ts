import { create } from 'zustand';

export type ListMode = 'tourism' | 'evacuation';

type ListModeState = {
  listMode: ListMode;
  setListMode: (mode: ListMode) => void;
};

export const useListModeStore = create<ListModeState>((set) => ({
  listMode: 'tourism',
  setListMode: (mode) => set({ listMode: mode }),
}));
