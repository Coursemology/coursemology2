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
