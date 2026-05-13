export type QuestionGradePrefillStatus = 'none' | 'zero' | 'full';

export interface QuestionGradeData {
  originalGrade: number | null | undefined;
  grade: number | null | undefined;
  prefilled: boolean; // backwards compatibility, to be removed after the prefillStatus is fully adopted
  prefillStatus: QuestionGradePrefillStatus;
  id: number; // answer ID
  grader?: {
    name: string;
    id: number;
  };
}
