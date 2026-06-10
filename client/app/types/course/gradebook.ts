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
}

export interface AssessmentData {
  id: number;
  title: string;
  tabId: number;
  maxGrade: number;
  gradebookWeight?: number | null;
}

export interface StudentData {
  id: number;
  name: string;
  email: string;
  externalId: string | null;
  level: number;
  totalXp: number;
}

export interface SubmissionData {
  submissionId: number;
  studentId: number;
  assessmentId: number;
  grade: number | null;
}

export interface GradebookData {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
  gamificationEnabled: boolean;
  userId?: number;
  weightedViewEnabled: boolean;
  canManageWeights: boolean;
}

export interface UpdateWeightsPayload {
  weights: {
    tabId: number;
    weight: number;
    weightMode?: 'equal' | 'custom';
    assessmentWeights?: { assessmentId: number; weight: number }[];
  }[];
}
