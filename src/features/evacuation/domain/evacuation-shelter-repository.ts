import type { EvacuationShelter } from './evacuation-shelter';

/** 避難所の永続化・取得を担うリポジトリ interface（domain 層）。 */
export type EvacuationShelterRepository = {
  /** 保存済みの避難所をすべて返す。 */
  findAll(): Promise<EvacuationShelter[]>;
  /** id に一致する避難所を返す。無ければ null。 */
  findById(id: string): Promise<EvacuationShelter | null>;
  /** 既存レコードをすべて置き換える（初回シード等）。 */
  replaceAll(shelters: EvacuationShelter[]): Promise<void>;
};
