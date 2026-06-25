import { produce } from 'immer';
import type {
  ExternalGradePayload,
  GradebookData,
  UpdateWeightsPayload,
} from 'types/course/gradebook';

import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from './types';

const SAVE_GRADEBOOK = 'course/gradebook/SAVE_GRADEBOOK';
const UPDATE_TAB_WEIGHTS = 'course/gradebook/UPDATE_TAB_WEIGHTS';
const SET_EXTERNAL_GRADE = 'course/gradebook/SET_EXTERNAL_GRADE';

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
  payload: UpdateWeightsPayload;
}

interface SetExternalGradeAction {
  type: typeof SET_EXTERNAL_GRADE;
  payload: ExternalGradePayload;
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
    action:
      | SaveGradebookAction
      | UpdateTabWeightsAction
      | SetExternalGradeAction,
  ) => {
    switch (action.type) {
      case SAVE_GRADEBOOK: {
        draft.categories = action.payload.categories;
        draft.tabs = action.payload.tabs;
        draft.assessments = action.payload.assessments;
        draft.students = action.payload.students;
        draft.submissions = action.payload.submissions;
        draft.gamificationEnabled = action.payload.gamificationEnabled;
        draft.weightedViewEnabled = action.payload.weightedViewEnabled;
        draft.canManageWeights = action.payload.canManageWeights;
        break;
      }
      case UPDATE_TAB_WEIGHTS: {
        action.payload.weights.forEach(
          ({
            tabId,
            weight,
            weightMode,
            assessmentWeights,
            excludedAssessmentIds,
          }) => {
            const tab = draft.tabs.find((t) => t.id === tabId);
            if (tab) {
              tab.gradebookWeight = weight;
              tab.weightMode = weightMode;
            }
            const excludedSet = new Set(excludedAssessmentIds ?? []);
            const tabAssessments = draft.assessments.filter(
              (a) => a.tabId === tabId,
            );
            tabAssessments.forEach((a) => {
              a.gradebookExcluded = excludedSet.has(a.id);
            });
            if (weightMode === 'equal') {
              tabAssessments.forEach((a) => {
                a.gradebookWeight = null;
              });
            } else if (assessmentWeights) {
              assessmentWeights.forEach(({ assessmentId, weight: aw }) => {
                const a = draft.assessments.find((x) => x.id === assessmentId);
                if (a) a.gradebookWeight = aw;
              });
            }
          },
        );
        break;
      }
      case SET_EXTERNAL_GRADE: {
        const { studentId, assessmentId, grade } = action.payload;
        const existing = draft.submissions.find(
          (s) => s.studentId === studentId && s.assessmentId === assessmentId,
        );
        if (existing) existing.grade = grade;
        else draft.submissions.push({ studentId, assessmentId, grade });
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
    payload: UpdateWeightsPayload,
  ): UpdateTabWeightsAction => ({
    type: UPDATE_TAB_WEIGHTS,
    payload,
  }),
  setExternalGrade: (
    payload: ExternalGradePayload,
  ): SetExternalGradeAction => ({ type: SET_EXTERNAL_GRADE, payload }),
};

export default reducer;
