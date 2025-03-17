import {
  LanguageData,
  MetadataTestCases,
  PackageImportResultError,
} from 'types/course/assessment/question/programming';

const CODAVERI_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
type Difficulty = (typeof CODAVERI_DIFFICULTIES)[number];

export interface CodaveriGenerateFormData {
  difficulty: Difficulty;
  languageId: LanguageData['id'];
  customPrompt: string;
}

export interface QuestionPrototypeFormData {
  question: {
    title: string;
    description: string;
  };
  testUi: {
    metadata: {
      solution: string;
      submission: string;
      testCases: MetadataTestCases;
    };
  };
}

export interface LockStates {
  [name: string]: boolean;
}

export interface GenerationState {
  activeConversationId: string;
  activeConversationFormTitle?: string;
  conversationIds: string[];
  conversations: { [id: string]: ConversationState };
}

export interface GenerationPageState extends GenerationState {
  conversationMetadata: { [id: string]: ConversationMetadata };
  exportCount: number;
  canExportCount: number;
}

// 'importing' - importing package (for autograding questions)
export type ExportStatus =
  | 'none'
  | 'pending'
  | 'importing'
  | 'exported'
  | 'error';

export type ExportError = PackageImportResultError;

export interface ConversationState {
  id: string;
  snapshots: { [id: string]: SnapshotState };
  latestSnapshotId: string;
  activeSnapshotId: string;
  activeSnapshotEditedData: QuestionPrototypeFormData;
  duplicateFromId?: string;
  toExport: boolean;
  exportStatus: ExportStatus;
  exportError?: ExportError;
  exportErrorMessage?: string;
  redirectEditUrl?: string;
  importJobUrl?: string;
  questionId?: number;
}

export interface ConversationMetadata {
  id: string;
  title: string;
  hasData: boolean;
  isGenerating: boolean;
}

export interface SnapshotState {
  id: string;
  parentId?: string;
  state: 'generating' | 'success' | 'sentinel';
  codaveriData?: CodaveriGenerateFormData;
  questionData?: QuestionPrototypeFormData;
  lockStates: LockStates;
}
