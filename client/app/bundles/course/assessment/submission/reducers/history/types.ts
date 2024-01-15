export interface QuestionHistory {
  answerIds: number[];
  isLoading: boolean;
  loaded: boolean;
  pastAnswersLoaded: boolean;
  selected?: number[];
}
