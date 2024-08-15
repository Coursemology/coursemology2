import { QuestionType } from 'types/course/assessment/question';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

interface AnswerCommonProps<T extends keyof typeof QuestionType> {
  answerId: number | null;
  question: SubmissionQuestionData<T>;
  readOnly: boolean;
  saveAnswerAndUpdateClientVersion: (answerId: number) => void;
}

export interface ScribingAnswerProps
  extends Omit<
    AnswerCommonProps<'Scribing'>,
    'readOnly' | 'saveAnswerAndUpdateClientVersion'
  > {}

export interface McqAnswerProps extends AnswerCommonProps<'MultipleChoice'> {
  showMcqMrqSolution: boolean;
  graderView: boolean;
}

export interface MrqAnswerProps extends AnswerCommonProps<'MultipleResponse'> {
  showMcqMrqSolution: boolean;
  graderView: boolean;
}

export interface ProgrammingAnswerProps
  extends AnswerCommonProps<'Programming'> {}

export interface TextResponseAnswerProps
  extends AnswerCommonProps<'TextResponse'> {
  handleUploadTextResponseFiles: (answerId: number) => void;
  graderView: boolean;
}

export interface FileUploadAnswerProps
  extends Omit<
    AnswerCommonProps<'FileUpload'>,
    'saveAnswerAndUpdateClientVersion'
  > {
  handleUploadTextResponseFiles: (answerId: number) => void;
  graderView: boolean;
}

export interface ComprehensionAnswerProps {}

export interface VoiceResponseAnswerProps
  extends AnswerCommonProps<'VoiceResponse'> {}

export interface ForumPostResponseAnswerProps
  extends AnswerCommonProps<'ForumPostResponse'> {}

export interface AnswerPropsMap {
  MultipleChoice: McqAnswerProps;
  MultipleResponse: MrqAnswerProps;
  Programming: ProgrammingAnswerProps;
  TextResponse: TextResponseAnswerProps;
  FileUpload: FileUploadAnswerProps;
  Comprehension: ComprehensionAnswerProps;
  Scribing: ScribingAnswerProps;
  VoiceResponse: VoiceResponseAnswerProps;
  ForumPostResponse: ForumPostResponseAnswerProps;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
}
