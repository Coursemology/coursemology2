import { AnswerData } from 'types/course/assessment/submission/answer';

export interface QuestionHistory {
  answerIds: number[];
  isLoading: boolean;
  loaded: boolean;
  pastAnswersLoaded: boolean;
  selected?: number[];
}

export type AnswerHistory = AnswerData & {
  createdAt: Date;
};
