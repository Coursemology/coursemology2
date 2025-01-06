import { LanguageMode } from '../question/programming';

export interface LiveFeedbackComments {
  lineNumber: number;
  comment: string;
}

export interface LiveFeedbackCode {
  id: number;
  filename: string;
  content: string;
  language: string;
  editorMode: LanguageMode;
}

export interface LiveFeedbackCodeAndComments extends LiveFeedbackCode {
  comments: LiveFeedbackComments[];
}

export interface LiveFeedbackHistory {
  id: number;
  createdAt: string;
  files: LiveFeedbackCodeAndComments[];
}

export interface QuestionInfo {
  id: number;
  title: string;
  description: string;
}

export interface LiveFeedbackHistoryState {
  liveFeedbackHistory: LiveFeedbackHistory[];
  question: QuestionInfo;
}
