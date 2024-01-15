export interface QuestionGradeData {
  originalGrade: number | null | undefined;
  grade: number | null | undefined;
  prefilled: boolean;
  id: number; // answer ID
  grader?: {
    name: string;
    id: number;
  };
}
