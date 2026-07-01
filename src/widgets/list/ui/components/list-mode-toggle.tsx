import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '@/shared/ui';

import { useListModeStore, type ListMode } from '../../store/use-list-mode-store';

const LIST_MODES: ListMode[] = ['tourism', 'evacuation'];

export function ListModeToggle() {
  const { t } = useTranslation();
  const listMode = useListModeStore((state) => state.listMode);
  const setListMode = useListModeStore((state) => state.setListMode);

  const segments = LIST_MODES.map((mode) => ({
    value: mode,
    label: t(`list.modeToggle.${mode}`),
  }));

  return (
    <SegmentedControl
      segments={segments}
      value={listMode}
      onChange={setListMode}
      segmentMinWidth={72}
    />
  );
}
