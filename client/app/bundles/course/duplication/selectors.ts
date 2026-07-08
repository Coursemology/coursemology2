import { createSelector } from '@reduxjs/toolkit';
import { AppState } from 'store';

import { DuplicationInstanceListData, DuplicationState } from './types';

export const selectDuplicationStore = (state: AppState): DuplicationState =>
  state.duplication as DuplicationState;

export const selectDestinationInstances = createSelector(
  selectDuplicationStore,
  (duplicationStore) =>
    duplicationStore.destinationInstances as Record<
      number,
      DuplicationInstanceListData
    >,
);

export const selectDestinationCourse = createSelector(
  selectDuplicationStore,
  (duplicationStore) => {
    const { destinationCourseId, destinationCourses } = duplicationStore;
    if (destinationCourseId === null || !destinationCourses) {
      return null;
    }
    return destinationCourses.find(
      (course) => course.id === destinationCourseId,
    );
  },
);
