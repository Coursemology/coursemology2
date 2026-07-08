import {
  RubricCategoryCriterionData,
  RubricCategoryData,
} from 'types/course/rubrics';

export enum RubricPlaygroundTab {
  EDIT,
  EVALUATE,
  COMPARE,
}

// Sentinel id for the client-only "Unsaved" draft revision shown while editing in the playground.
export const UNSAVED_RUBRIC_ID = -1;

// Minimal shape the version slider needs per revision mark (saved rubrics plus the unsaved draft).
export interface SliderRevision {
  id: number;
  createdAt: string;
  isActive?: boolean;
  isUnsaved?: boolean;
}

export interface RubricCategoryEntity
  extends Omit<RubricCategoryData, 'maximumGrade'> {
  criterions: RubricCategoryCriterionEntity[];
  toBeDeleted?: boolean;
  draft?: boolean;
}

export interface RubricCategoryCriterionEntity
  extends RubricCategoryCriterionData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export interface RubricEditFormData {
  categories: RubricCategoryEntity[];
  gradingPrompt: string;
  modelAnswer: string;
}

// A row in the "Apply" confirmation table: a student's official (grading) state side-by-side with the
// selected revision's evaluation that would replace it. Built from the store's answers, grading
// evaluations, and the selected rubric's llm evaluations. `evaluationGrade` is undefined when the answer
// has no evaluation for the selected revision yet.
export interface ApplyEvaluationRow {
  answerId: number;
  studentName: string;
  // Whether this is the submission's latest (current) attempt, used to filter to latest answers only.
  currentAnswer: boolean;
  submissionId?: number;
  submissionStatus: string;
  answerText: string;
  maximumGrade: number;
  // The official grade and the rubric revision it was evaluated against. currentGrade is undefined when not
  // yet graded; gradingRubricId is null when graded by hand without AI ("manually graded"), undefined when
  // there is no grading evaluation at all.
  currentGrade?: number;
  gradingRubricId?: number | null;
  // Whether the official grade has a category with no selection (drives the "Incomplete" status).
  currentIncomplete: boolean;
  // Whether the official grade's per-category breakdown matches the active rubric's evaluation exactly
  // (drives "Up-to-date" vs "Modified"). Compared per category, not just on the total.
  gradingMatchesEvaluation: boolean;
  // The selected revision's evaluation (the "New Grade" / "Feedback" columns).
  evaluationGrade?: number;
  evaluationComment?: string;
}
