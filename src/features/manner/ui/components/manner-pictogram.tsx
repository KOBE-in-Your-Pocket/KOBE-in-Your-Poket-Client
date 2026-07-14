import { Image } from 'expo-image';

import type { MannerItem } from '../../domain/manner-item';

import { MannerIcon } from './manner-icon';

/** MannerItem.icon（識別キー）→ ピクトグラム画像のマッピング。未登録キーは MannerIcon にフォールバックする。 */
const PICTOGRAM_MAP: Record<string, number> = {
  'no-eating-while-walking': require('@/assets/images/manners/no-eating-while-walking.png'),
  'put-trash-in-bin': require('@/assets/images/manners/put-trash-in-bin.png'),
  'no-trespassing': require('@/assets/images/manners/no-trespassing.png'),
  'handle-products-with-care': require('@/assets/images/manners/handle-products-with-care.png'),
  'do-not-obstruct-pedestrians': require('@/assets/images/manners/do-not-obstruct-pedestrians.png'),
  'no-smoking-while-walking': require('@/assets/images/manners/no-smoking-while-walking.png'),
  'hold-your-suitcase': require('@/assets/images/manners/hold-your-suitcase.png'),
  'backpack-on-front': require('@/assets/images/manners/backpack-on-front.png'),
  'show-consideration': require('@/assets/images/manners/show-consideration.png'),
  'no-loud-conversation': require('@/assets/images/manners/no-loud-conversation.png'),
  'no-phone-calls': require('@/assets/images/manners/no-phone-calls.png'),
};

/**
 * MannerItem 用のピクトグラム画像。
 * `icon` に対応する画像が無い場合は既存の {@link MannerIcon} にフォールバックする。
 */
export function MannerPictogram({ icon, size = 40 }: { icon: MannerItem['icon']; size?: number }) {
  const source = Object.hasOwn(PICTOGRAM_MAP, icon) ? PICTOGRAM_MAP[icon] : undefined;

  if (!source) {
    return <MannerIcon icon={icon} size={Math.round(size * 0.55)} />;
  }

  return (
    <Image
      source={source}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      contentFit="cover"
    />
  );
}
