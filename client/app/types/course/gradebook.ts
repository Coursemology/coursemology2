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
}

export interface SubmissionData {
  studentId: number;
  assessmentId: number;
  submissionId?: number;
  grade: number | null;
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
}

export interface UpdateWeightsPayload {
  weights: {
    tabId: number;
    weight: number;
    weightMode?: 'equal' | 'custom';
    excludedAssessmentIds?: number[];
    assessmentWeights?: { assessmentId: number; weight: number }[];
  }[];
}

export interface ExternalAssessmentNode {
  assessment: AssessmentData;
  tab: TabData;
  category: CategoryData;
}

export interface ExternalAssessmentUpdate {
  assessment: AssessmentData;
  tab: Pick<TabData, 'id' | 'title' | 'categoryId'>;
}

export interface ExternalGradePayload {
  studentId: number;
  assessmentId: number;
  grade: number | null;
}

export type IdentifierMode = 'email' | 'student_id';

export interface ImportComponent {
  name: string;
  weightage: number;
  maximumGrade: number;
}

export interface ExistingExternalAssessment {
  name: string;
  maximumGrade: number;
  weightage: number;
}

export interface ImportPreviewRequest {
  components: ImportComponent[];
  identifierMode: IdentifierMode;
  csvData: string;
}

export interface ImportConflict {
  component: string;
  studentName: string;
  existingGrade: number;
  inFileGrade: number;
  identifierMismatch: boolean;
}

export interface ImportPreviewResult {
  ok: boolean;
  unresolved: string[];
  malformed: string[];
  sample: { studentName: string; grades: Record<string, number | null> }[];
  conflicts: ImportConflict[];
}

export interface ImportCommitSummary {
  createdComponents: number;
  updatedComponents: number;
  gradesWritten: number;
}
