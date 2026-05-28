import { produce } from 'immer';
import type { GradebookData, UpdateWeightsPayload } from 'types/course/gradebook';

import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from './types';

const SAVE_GRADEBOOK = 'course/gradebook/SAVE_GRADEBOOK';
const UPDATE_TAB_WEIGHTS = 'course/gradebook/UPDATE_TAB_WEIGHTS';

interface GradebookState {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
  gamificationEnabled: boolean;
  weightedViewEnabled: boolean;
  canManageWeights: boolean;
}

interface SaveGradebookAction {
  type: typeof SAVE_GRADEBOOK;
  payload: GradebookData;
}

interface UpdateTabWeightsAction {
  type: typeof UPDATE_TAB_WEIGHTS;
  payload: UpdateWeightsPayload['weights'];
}

const initialState: GradebookState = {
  categories: [],
  tabs: [],
  assessments: [],
  students: [],
  submissions: [],
  gamificationEnabled: false,
  weightedViewEnabled: false,
  canManageWeights: false,
};

const reducer = produce(
  (
    draft: GradebookState,
    action: SaveGradebookAction | UpdateTabWeightsAction,
  ) => {
    switch (action.type) {
      case SAVE_GRADEBOOK: {
        const payload = (action as SaveGradebookAction).payload;
        draft.categories = payload.categories;
        draft.tabs = payload.tabs;
        draft.assessments = payload.assessments;
        draft.students = payload.students;
        draft.submissions = payload.submissions;
        draft.gamificationEnabled = payload.gamificationEnabled;
        draft.weightedViewEnabled = payload.weightedViewEnabled;
        draft.canManageWeights = payload.canManageWeights;
        break;
      }
      case UPDATE_TAB_WEIGHTS: {
        const weights = (action as UpdateTabWeightsAction).payload;
        weights.forEach(({ tabId, weight }) => {
          const tab = draft.tabs.find((t) => t.id === tabId);
          if (tab) {
            tab.gradebookWeight = weight;
          }
        });
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
  updateTabWeights: (
    weights: UpdateWeightsPayload['weights'],
  ): UpdateTabWeightsAction => ({
    type: UPDATE_TAB_WEIGHTS,
    payload: weights,
  }),
};

export default reducer;
