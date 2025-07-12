import { OptionEntity } from 'types/course/assessment/question/multiple-responses';
import {
  LanguageData,
  MetadataTestCases,
  PackageImportResultError,
} from 'types/course/assessment/question/programming';

const CODAVERI_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
type Difficulty = (typeof CODAVERI_DIFFICULTIES)[number];

export interface ProgrammingGenerateFormData {
  difficulty: Difficulty;
  languageId: LanguageData['id'];
  customPrompt: string;
}

export interface MrqGenerateFormData {
  customPrompt: string;
  numberOfQuestions: number;
}

export interface ProgrammingPrototypeFormData {
  question: {
    title: string;
    description: string;
  };
  testUi: {
    metadata: {
      prepend: string | null;
      append: string | null;
      solution: string;
      submission: string;
      testCases: MetadataTestCases;
    };
  };
}

export interface MrqPrototypeFormData {
  question: {
    title: string;
    description: string;
    skipGrading: boolean;
    randomizeOptions: boolean;
  };
  options: OptionEntity[];
  gradingScheme: 'any_correct' | 'all_correct';
}

export type LockStates = Record<string, boolean>;

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
  activeSnapshotEditedData: ProgrammingPrototypeFormData | MrqPrototypeFormData;
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
  generateFormData?: ProgrammingGenerateFormData | MrqGenerateFormData;
  questionData?: ProgrammingPrototypeFormData | MrqPrototypeFormData;
  lockStates: LockStates;
}
