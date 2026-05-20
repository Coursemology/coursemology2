import { produce } from 'immer';

import type { GradebookData } from 'types/course/gradebook';

import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from './types';

const SAVE_GRADEBOOK = 'course/gradebook/SAVE_GRADEBOOK';

interface GradebookState {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
}

interface SaveGradebookAction {
  type: typeof SAVE_GRADEBOOK;
  payload: GradebookData;
}

const initialState: GradebookState = {
  categories: [],
  tabs: [],
  assessments: [],
  students: [],
  submissions: [],
};

const reducer = produce(
  (draft: GradebookState, action: SaveGradebookAction) => {
    switch (action.type) {
      case SAVE_GRADEBOOK: {
        draft.categories = action.payload.categories;
        draft.tabs = action.payload.tabs;
        draft.assessments = action.payload.assessments;
        draft.students = action.payload.students;
        draft.submissions = action.payload.submissions;
        break;
      }
      default:
        break;
    }
  },
  initialState,
);

export const actions = {
  saveGradebook: (data: GradebookData): SaveGradebookAction => ({
    type: SAVE_GRADEBOOK,
    payload: data,
  }),
};

export default reducer;
