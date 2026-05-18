export interface TabData {
  id: number;
  title: string;
  categoryId: number;
  categoryTitle: string;
}

export interface AssessmentData {
  id: number;
  title: string;
  tabId: number;
  maxGrade: number;
}

export interface StudentRow {
  id: number;
  name: string;
  grades: Record<string, number>; // assessmentId (as string) → grade
  totalGrade: number;
  totalMaxGrade: number;
}

export interface GradebookData {
  tabs: TabData[];
  assessments: AssessmentData[];
  students: StudentRow[];
}
