export interface AnswerTableEntry {
  id: number;
  title: string;
  answerText: string;
  evaluation?: {
    totalGrade?: number;
    grades?: Record<number, number>;
    feedback: string;
  };
  isMock?: boolean;
  isEvaluating: boolean;
}
