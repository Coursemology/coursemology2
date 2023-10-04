import { createSelector } from '@reduxjs/toolkit';
import { AppState, dispatch as imperativeDispatch, Selector } from 'store';

import { updateUnread } from 'course/container/unread';

import { useAppSelector } from './store';

const selectUnreadCountForItem = (key: string): Selector<number | undefined> =>
  createSelector(
    (state: AppState) => state.unread,
    (unread) => unread[key],
  );

export const useUnreadCountForItem = (key: string): number | undefined =>
  useAppSelector(selectUnreadCountForItem(key));

/**
 * When the time comes that the Signals framework is used for more than unread counts,
 * consider moving this function to some `signals.ts` file and make it general-purpose.
 */
export const syncSignals = (signals: Record<string, number>): void => {
  imperativeDispatch(updateUnread(signals));
};
