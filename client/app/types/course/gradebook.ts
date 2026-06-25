export interface CategoryData {
  id: number;
  title: string;
}

export interface TabData {
  id: number;
  title: string;
  categoryId: number;
  gradebookWeight?: number;
  weightMode?: 'equal' | 'custom';
  keepHighest?: number;
}

export interface AssessmentData {
  id: number;
  title: string;
  tabId: number;
  maxGrade: number;
  gradebookWeight?: number | null;
  gradebookExcluded?: boolean;
  external?: boolean;
  floorAtZero?: boolean;
  capAtMaximum?: boolean;
}

export interface StudentData {
  id: number;
  name: string;
  email: string;
  externalId: string | null;
  level: number;
  totalXp: number;
  levelContribution: number | null;
}

export interface SubmissionData {
  studentId: number;
  assessmentId: number;
  submissionId?: number;
  grade: number | null;
}

export interface LevelContributionData {
  enabled: boolean;
  formula: string;
  weight: number;
  show: boolean;
  clamp: boolean;
}

export interface GradebookData {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
  gamificationEnabled: boolean;
  weightedViewEnabled: boolean;
  canManageWeights: boolean;
  courseMaxLevel: number;
  levelContribution: LevelContributionData;
}

export interface UpdateWeightsPayload {
  weights: {
    tabId: number;
    weight: number;
    weightMode?: 'equal' | 'custom';
    keepHighest?: number;
    excludedAssessmentIds?: number[];
    assessmentWeights?: { assessmentId: number; weight: number }[];
  }[];
  levelContribution?: LevelContributionSaveData;
}

export type FormulaNode =
  | { type: 'num'; value: number }
  | { type: 'var'; name: 'level' }
  | { type: 'neg'; operand: FormulaNode }
  | {
      type: 'binop';
      op: '+' | '-' | '*' | '/';
      left: FormulaNode;
      right: FormulaNode;
    }
  | { type: 'call1'; fn: 'floor' | 'ceil' | 'round'; arg: FormulaNode }
  | { type: 'call2'; fn: 'min' | 'max'; a: FormulaNode; b: FormulaNode };

export interface LevelContributionSaveData extends LevelContributionData {
  formulaAst: FormulaNode | null;
}

export interface ExternalGradePayload {
  studentId: number;
  assessmentId: number;
  grade: number | null;
}
