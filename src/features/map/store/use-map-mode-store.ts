import { create } from 'zustand';

/** 地図画面の表示モード。観光名所ピン / 避難所ピンを切り替える。 */
export type MapMode = 'tourism' | 'evacuation';

type MapModeState = {
  /** 現在の地図モード。デフォルトは tourism。 */
  mapMode: MapMode;
  /** 地図モードを設定する。 */
  setMapMode: (mode: MapMode) => void;
};

export const useMapModeStore = create<MapModeState>((set) => ({
  mapMode: 'tourism',
  setMapMode: (mode) => set({ mapMode: mode }),
}));
