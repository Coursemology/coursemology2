export interface RubricData {
  id: number;
  createdAt: string;
  categories: RubricCategoryData[];
  gradingPrompt: string;
  modelAnswer: string;
  summary: string;
  // Structural fingerprint: revisions with the same contentHash are compatible (grades carry across them
  // without loss). Used to warn before making a structurally incompatible revision active.
  contentHash: string;
  // Whether this rubric is the question's active_rubric. Only populated by the rubrics index endpoint.
  isActive?: boolean;
}

export interface RubricDataWithEvaluations extends RubricData {
  answerEvaluations: Record<number, RubricAnswerEvaluationData>;
  mockAnswerEvaluations: Record<number, RubricMockAnswerEvaluationData>;
}

export interface RubricPostRequestData {
  grading_prompt: string;
  model_answer: string;
  categories_attributes: {
    name: string;
    criterions_attributes: {
      grade: number;
      explanation: string;
    }[];
  }[];
}

export interface RubricCategoryData {
  id: number;
  name: string;
  maximumGrade: number;
  criterions: RubricCategoryCriterionData[];
}

export interface RubricCategoryCriterionData {
  id: number;
  grade: number;
  explanation: string;
}

export type RubricEvaluationType =
  | 'grading'
  | 'playground'
  | 'playground_hidden';

export interface RubricAnswerEvaluationData {
  id?: number;
  answerId: number;
  rubricId?: number;
  // 'playground' = a rubric version's raw evaluation (playground table); 'grading' = the official applied
  // grade. ('playground_hidden' is dismissed and is not returned by the fetch.)
  evaluationType?: RubricEvaluationType;
  selections?: {
    mockAnswerId: number;
    categoryId: number;
    // null when the category has not been graded (e.g. a category added after grading).
    criterionId: number | null;
    grade: number;
  }[];
  feedback?: string;
  jobUrl?: string;
}

export interface RubricMockAnswerEvaluationData {
  mockAnswerId: number;
  selections?: {
    mockAnswerId: number;
    categoryId: number;
    criterionId: number;
    grade: number;
  }[];
  feedback?: string;
  jobUrl?: string;
}

// A question's grading context, used by the playground's "write a custom answer" flow to capture
// author-supplied content per context.
export interface RubricGradingContextData {
  id: number;
  identifier: string;
  contextType: string;
  // The sibling source question's title (for the field heading); null for intrinsic providers (forum thread).
  sourceTitle: string | null;
}

export interface RubricAnswerData {
  id: number;
  title: string;
  // Whether this is the submission's latest (current) attempt -- lets the UI show only the latest answer
  // per student. Mirrors the `current_answer` flag used by the past-answers views.
  currentAnswer: boolean;
  grade?: number;
  answerText: string;
  submissionId?: number;
  submissionStatus?: string;
}
