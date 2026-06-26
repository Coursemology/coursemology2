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
  tab: Pick<TabData, 'id' | 'title' | 'categoryId' | 'gradebookWeight'>;
}

export interface ExternalGradePayload {
  studentId: number;
  assessmentId: number;
  grade: number | null;
}

export type IdentifierMode = 'email' | 'external_id';

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

export interface ConflictCell {
  existing: number | null;
  inFile: number | null;
  changed: boolean;
}

export interface ConflictRow {
  identifier: string;
  studentName: string;
  cells: Record<string, ConflictCell>;
}

export interface ReassignedIdentifier {
  // Advisory: this identifier was previously imported as the binding key for a
  // grade now owned by a DIFFERENT student (e.g. an External ID recycled). The
  // grade is still matched by the current student; this flags it for confirmation.
  identifier: string;
  currentStudent: string;
  previousStudents: string[];
}

export interface ImportPreviewResult {
  ok: boolean;
  unresolved: string[];
  malformed: string[];
  outOfRange: {
    identifier: string;
    component: string;
    grade: number;
    max: number;
    kind: 'below' | 'above';
  }[];
  sample: { identifier: string; grades: Record<string, number | null> }[];
  conflictRows: ConflictRow[];
  reassignments: ReassignedIdentifier[];
  totalRows: number;
  columnOrder: string[];
}

export interface ImportCommitSummary {
  createdComponents: number;
  updatedComponents: number;
  gradesWritten: number;
}
