import { StyleSheet } from 'react-native';

import { BottomTabInset, Spacing } from '@/shared/config';

export const ROUTE_CLEAR_COLOR = '#208AEF';
export const NAV_BUTTON_COLOR = '#208AEF';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  routeBanner: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: BottomTabInset + Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  routeInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  routeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  navButton: {
    backgroundColor: NAV_BUTTON_COLOR,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.five,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  routeClear: {
    color: ROUTE_CLEAR_COLOR,
    fontWeight: '700',
  },
});
