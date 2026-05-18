import { produce } from 'immer';
import type {
  AssessmentData,
  StudentRow,
  TabData,
} from 'types/course/gradebook';

import {
  GradebookActionType,
  GradebookState,
  SAVE_GRADEBOOK,
  SaveGradebookAction,
} from './types';

const initialState: GradebookState = {
  tabs: [],
  assessments: [],
  students: [],
};

const reducer = produce(
  (draft: GradebookState, action: GradebookActionType) => {
    switch (action.type) {
      case SAVE_GRADEBOOK: {
        draft.tabs = action.tabs;
        draft.assessments = action.assessments;
        draft.students = action.students;
        break;
      }
      default:
        break;
    }
  },
  initialState,
);

export const actions = {
  saveGradebook: (
    tabs: TabData[],
    assessments: AssessmentData[],
    students: StudentRow[],
  ): SaveGradebookAction => ({
    type: SAVE_GRADEBOOK,
    tabs,
    assessments,
    students,
  }),
};

export default reducer;
