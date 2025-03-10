import { LanguageMode } from '../question/programming';

export interface QuestionInfo {
  id: number;
  title: string;
  description: string;
}

export interface MessageFile {
  id: number;
  filename: string;
  content: string;
  language: string;
  editorMode: LanguageMode;
  highlightedContent: string | null;
}

export interface LiveFeedbackChatMessage {
  id: number;
  content: string;
  createdAt: string;
  creatorId: number;
  isError: boolean;
  files: MessageFile[];
}

export interface LiveFeedbackHistoryState {
  messages: LiveFeedbackChatMessage[];
  question: QuestionInfo;
}
