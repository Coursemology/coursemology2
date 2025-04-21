import { QuestionType } from '../../question';
import { CategoryData } from '../../question/rubric-based-responses';

interface QuestionData {
  id: number;
  description: string;
  maximumGrade: number;
  autogradable: boolean;
  canViewHistory: boolean;
  type: QuestionType;
}

interface MultipleResponseQuestionData {
  options: { id: number; option: string; correct?: boolean }[];
}

interface ProgrammingQuestionData {
  language: string;
  fileSubmission: boolean;
  isCodaveri: boolean;
  attemptLimit?: number;
}

interface TextResponseParentQuestionData {}

interface TextResponseAttachmentData extends TextResponseParentQuestionData {
  maxAttachments: number;
  maxAttachmentSize: number | null;
  isAttachmentRequired: boolean;
}

interface TextResponseQuestionData extends TextResponseAttachmentData {
  solutions?: {
    id: number;
    solutionType: 'exact_match' | 'keyword';
    solution: string;
    grade: number;
  };
}

interface FileUploadQuestionData extends TextResponseAttachmentData {}

interface ComprehensionQuestionData extends TextResponseParentQuestionData {
  groups?: {
    id: number;
    maximumGroupGrade: number;
    points: {
      id: number;
      pointGrade: number;
      solutions: {
        id: number;
        solutionType: 'compre_keyword' | 'compre_lifted_word';
        solution: string;
        solutionLemma: string;
        information: string;
      };
    }[];
  };
}

interface ScribingQuestionData {}

interface VoiceResponseQuestionData {}

interface ForumPostResponseQuestionData {
  hasTextResponse: boolean;
  maxPosts: boolean;
}

export interface RubricBasedResponseCategoryQuestionData
  extends Omit<CategoryData, 'id' | 'grades'> {
  id: number;
  grades: {
    id: number;
    grade: number;
    explanation: string;
  }[];
}

interface RubricBasedResponseQuestionData {
  categories: RubricBasedResponseCategoryQuestionData[];
}

export interface SpecificQuestionDataMap {
  MultipleChoice: MultipleResponseQuestionData;
  MultipleResponse: MultipleResponseQuestionData;
  Programming: ProgrammingQuestionData;
  TextResponse: TextResponseQuestionData;
  FileUpload: FileUploadQuestionData;
  Comprehension: ComprehensionQuestionData;
  Scribing: ScribingQuestionData;
  VoiceResponse: VoiceResponseQuestionData;
  ForumPostResponse: ForumPostResponseQuestionData;
  RubricBasedResponse: RubricBasedResponseQuestionData;
}

export interface SubmissionQuestionBaseData extends QuestionData {
  questionNumber: number;
  questionTitle: string;
  submissionQuestionId: number;
  topicId: number;
  answerId?: number;
  isCodaveri?: boolean;
  // Derived within redux reducer
  liveFeedbackEnabled?: boolean;
  attemptsLeft?: number;
  attemptLimit?: number;
  viewHistory?: boolean;
}

export type SubmissionQuestionData<T extends keyof typeof QuestionType> =
  SubmissionQuestionBaseData & SpecificQuestionDataMap[T];
