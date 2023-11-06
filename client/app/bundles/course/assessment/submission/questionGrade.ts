export interface QuestionGradeData {
  grade?: number | string;
  originalGrade?: number | string;
  grader?: {
    name?: string;
    id?: number;
  };
  prefilled?: boolean;
}

interface OptionData {
  id: number;
  option: string;
  correct?: boolean;
}

export interface QuestionData {
  allowAttachment?: boolean;
  description: string;
  displayTitle: string;
  language?: string;
  maximumGrade: number;
  options?: OptionData[];
  type: string;
  answerId?: number;
  topicId: number;
  autogradable?: boolean;
  viewHistory: boolean;
  canViewHistory: boolean;
}

export interface SubmissionQuestionData extends QuestionData {
  id: number;
  submissionQuestionId: number;
}

export interface HistoryQuestion {
  loaded: boolean;
  isLoading: boolean;
  answerIds: number[];
  selected: number[];
  pastAnswersLoaded?: boolean;
}

export interface QuestionFlags {
  jobError: boolean;
  jobErrorMessage: string;
  isAutograding: boolean;
  isResetting: boolean;
}
