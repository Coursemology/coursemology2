import { produce } from 'immer';
import type {
  ExternalAssessmentNode,
  ExternalAssessmentUpdate,
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
const APPLY_CREATED_EXTERNAL = 'course/gradebook/APPLY_CREATED_EXTERNAL';
const UPDATE_EXTERNAL_ASSESSMENT =
  'course/gradebook/UPDATE_EXTERNAL_ASSESSMENT';
const DELETE_EXTERNAL_ASSESSMENT =
  'course/gradebook/DELETE_EXTERNAL_ASSESSMENT';
const REORDER_EXTERNAL_ASSESSMENTS =
  'course/gradebook/REORDER_EXTERNAL_ASSESSMENTS';
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

interface ApplyCreatedExternalAction {
  type: typeof APPLY_CREATED_EXTERNAL;
  payload: ExternalAssessmentNode;
}
interface UpdateExternalAssessmentAction {
  type: typeof UPDATE_EXTERNAL_ASSESSMENT;
  payload: ExternalAssessmentUpdate;
}
interface DeleteExternalAssessmentAction {
  type: typeof DELETE_EXTERNAL_ASSESSMENT;
  payload: number; // negative serialized assessment id
}
interface ReorderExternalAssessmentsAction {
  type: typeof REORDER_EXTERNAL_ASSESSMENTS;
  payload: number[]; // negative serialized assessment ids, new order
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
      | ApplyCreatedExternalAction
      | UpdateExternalAssessmentAction
      | DeleteExternalAssessmentAction
      | ReorderExternalAssessmentsAction
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
      case APPLY_CREATED_EXTERNAL: {
        const { assessment, tab, category } = action.payload;
        if (!draft.categories.some((c) => c.id === category.id)) {
          draft.categories.push(category);
        }
        if (!draft.tabs.some((t) => t.id === tab.id)) {
          draft.tabs.push(tab);
        }
        if (!draft.assessments.some((a) => a.id === assessment.id)) {
          draft.assessments.push(assessment);
        }
        break;
      }
      case UPDATE_EXTERNAL_ASSESSMENT: {
        const { assessment, tab } = action.payload;
        const a = draft.assessments.find((x) => x.id === assessment.id);
        if (a) {
          a.title = assessment.title;
          a.maxGrade = assessment.maxGrade;
          a.floorAtZero = assessment.floorAtZero;
          a.capAtMaximum = assessment.capAtMaximum;
        }
        const t = draft.tabs.find((x) => x.id === tab.id);
        if (t) {
          t.title = tab.title;
          if (tab.gradebookWeight !== undefined) {
            t.gradebookWeight = tab.gradebookWeight;
          }
        }
        break;
      }
      case DELETE_EXTERNAL_ASSESSMENT: {
        const id = action.payload;
        const removed = draft.assessments.find((a) => a.id === id);
        draft.assessments = draft.assessments.filter((a) => a.id !== id);
        draft.submissions = draft.submissions.filter(
          (s) => s.assessmentId !== id,
        );
        if (
          removed &&
          !draft.assessments.some((a) => a.tabId === removed.tabId)
        ) {
          const removedTab = draft.tabs.find((t) => t.id === removed.tabId);
          draft.tabs = draft.tabs.filter((t) => t.id !== removed.tabId);
          // Drop the now-empty synthetic "External Assessments" category so its
          // header doesn't linger after the last external is deleted (the
          // backend omits it entirely once no externals remain).
          if (
            removedTab &&
            !draft.tabs.some((t) => t.categoryId === removedTab.categoryId)
          ) {
            draft.categories = draft.categories.filter(
              (c) => c.id !== removedTab.categoryId,
            );
          }
        }
        break;
      }
      case REORDER_EXTERNAL_ASSESSMENTS: {
        const rank = new Map(action.payload.map((id, i) => [id, i]));
        const externalsSorted = draft.assessments
          .filter((a) => a.external)
          .sort((x, y) => (rank.get(x.id) ?? 0) - (rank.get(y.id) ?? 0));
        let ai = 0;
        draft.assessments = draft.assessments.map((a) => {
          if (!a.external) return a;
          const next = externalsSorted[ai];
          ai += 1;
          return next;
        });
        const tabRank = new Map(externalsSorted.map((a, i) => [a.tabId, i]));
        const tabsSorted = draft.tabs
          .filter((t) => tabRank.has(t.id))
          .sort((x, y) => (tabRank.get(x.id) ?? 0) - (tabRank.get(y.id) ?? 0));
        let ti = 0;
        draft.tabs = draft.tabs.map((t) => {
          if (!tabRank.has(t.id)) return t;
          const next = tabsSorted[ti];
          ti += 1;
          return next;
        });
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
  applyCreatedExternal: (
    payload: ExternalAssessmentNode,
  ): ApplyCreatedExternalAction => ({ type: APPLY_CREATED_EXTERNAL, payload }),
  updateExternalAssessment: (
    payload: ExternalAssessmentUpdate,
  ): UpdateExternalAssessmentAction => ({
    type: UPDATE_EXTERNAL_ASSESSMENT,
    payload,
  }),
  deleteExternalAssessment: (id: number): DeleteExternalAssessmentAction => ({
    type: DELETE_EXTERNAL_ASSESSMENT,
    payload: id,
  }),
  reorderExternalAssessments: (
    payload: number[],
  ): ReorderExternalAssessmentsAction => ({
    type: REORDER_EXTERNAL_ASSESSMENTS,
    payload,
  }),
  setExternalGrade: (
    payload: ExternalGradePayload,
  ): SetExternalGradeAction => ({ type: SET_EXTERNAL_GRADE, payload }),
};

export default reducer;
