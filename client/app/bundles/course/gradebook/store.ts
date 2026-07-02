import { produce } from 'immer';
import type {
  GradebookData,
  LevelContributionData,
  UpdateWeightsPayload,
} from 'types/course/gradebook';

import { evaluateNode } from './levelFormula';
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
  levelContribution: LevelContributionData;
  courseMaxLevel: number;
}

interface SaveGradebookAction {
  type: typeof SAVE_GRADEBOOK;
  payload: GradebookData;
}

interface UpdateTabWeightsAction {
  type: typeof UPDATE_TAB_WEIGHTS;
  payload: UpdateWeightsPayload;
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
  levelContribution: {
    enabled: false,
    formula: '',
    weight: 0,
    show: false,
    clamp: true,
  },
  courseMaxLevel: 0,
};

const reducer = produce(
  (
    draft: GradebookState,
    action: SaveGradebookAction | UpdateTabWeightsAction,
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
        draft.levelContribution =
          action.payload.levelContribution ?? initialState.levelContribution;
        draft.courseMaxLevel = action.payload.courseMaxLevel ?? 0;
        break;
      }
      case UPDATE_TAB_WEIGHTS: {
        action.payload.weights.forEach(
          ({
            tabId,
            weight,
            weightMode,
            keepHighest,
            assessmentWeights,
            excludedAssessmentIds,
          }) => {
            const tab = draft.tabs.find((t) => t.id === tabId);
            if (tab) {
              tab.gradebookWeight = weight;
              tab.weightMode = weightMode;
              tab.keepHighest = keepHighest ?? 0;
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
        if (action.payload.levelContribution) {
          const { formulaAst, ...lcData } = action.payload.levelContribution;
          draft.levelContribution = lcData;
          if (lcData.enabled && formulaAst) {
            draft.students.forEach((student) => {
              const val = evaluateNode(formulaAst, { level: student.level });
              if (!Number.isFinite(val)) {
                student.levelContribution = null;
              } else {
                student.levelContribution = lcData.clamp
                  ? Math.min(Math.max(val, 0), lcData.weight)
                  : val;
              }
            });
          } else {
            draft.students.forEach((student) => {
              student.levelContribution = null;
            });
          }
        }
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
};

export default reducer;
