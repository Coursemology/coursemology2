// BE Data Type

export interface AnswerBaseData {
  id: number;
  questionId: number;
  createdAt: string;
  clientVersion: number | null;
  isDraftAnswer: boolean;
  grading: {
    id: number; // Answer ID
    grade?: number | null;
    grader?: {
      id: number;
      name: string;
    };
  };
}

export interface AnswerFieldBaseData {
  id: number;
  questionId: number;
}

// FE Data Type

export interface AnswerFieldBaseEntity {
  id: AnswerFieldBaseData['id'];
  questionId: AnswerFieldBaseData['questionId'];
}
