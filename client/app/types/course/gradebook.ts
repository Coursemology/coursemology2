export interface CategoryData {
  id: number;
  title: string;
}

export interface TabData {
  id: number;
  title: string;
  categoryId: number;
}

export interface AssessmentData {
  id: number;
  title: string;
  tabId: number;
  maxGrade: number;
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
  submissionId: number;
  grade: number | null;
}

export interface GradebookData {
  categories: CategoryData[];
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentData[];
  submissions: SubmissionData[];
  gamificationEnabled: boolean;
}
