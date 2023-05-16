import { ScribingQuestion } from 'types/course/assessment/question/scribing';

export interface ScribingQuestionState {
  question: ScribingQuestion;
  isLoading: boolean;
  isSubmitting: boolean;
}
