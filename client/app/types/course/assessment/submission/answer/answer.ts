// BE Data Type

export interface AnswerBaseData {
  id: number;
  questionId: number;
  createdAt: string;
  clientVersion: number | null;
  grading: {
    id: number; // Answer ID
    grade?: number | null;
    grader?: {
      id: number;
      name: string;
    };
  };
  // The rubric grade breakdown, present for any rubric-graded answer (RubricBasedResponse, ForumPost, ...).
  // Its presence is what drives the rubric UI in the submission view, regardless of question type.
  // (Matches the store's CategoryGradeType: a null gradeId/grade means the category is not yet graded.)
  categoryGrades?: {
    id: number;
    gradeId: number | null;
    categoryId: number;
    grade: number | null;
    explanation: string | null;
  }[];
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
