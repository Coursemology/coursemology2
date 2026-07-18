import { AvailableSkills, QuestionFormData } from '../questions';

export interface NumericRandomConfig {
  mode: 'numeric';
  min: number;
  max: number;
  roundToInteger: boolean;
}

export interface DateRandomConfig {
  mode: 'date';
  min: Date;
  max: Date;
  roundToDay: boolean;
}

export interface OverrideRandomConfig {
  mode: 'override';
  value: string;
}

export interface ShuffleRandomConfig {
  mode: 'shuffle';
}

export interface StringRandomConfig {
  mode: 'string';
  randomizeDigits: boolean;
  randomizeLetters: boolean;
}

export interface NoRandomConfig {
  mode: 'off';
}

export type CellRandomConfig = (
  | NumericRandomConfig
  | DateRandomConfig
  | OverrideRandomConfig
  | ShuffleRandomConfig
  | StringRandomConfig
  | NoRandomConfig
) & { cell: string };

export type CellRandomConfigBody<M extends CellRandomConfig['mode']> = Omit<
  Extract<CellRandomConfig, { mode: M }>,
  'mode' | 'cell'
>;

export type SolutionType =
  | 'exact_match'
  | 'keyword'
  | 'regex'
  | 'spreadsheet_formula';

export interface SolutionData {
  id: number | string;
  solution: string;
  solutionType: SolutionType;
  grade: number | string;
  explanation: string;
  spreadsheet?: {
    id?: number;
    isRandomizationEnabled: boolean;
    isRandomSeedFixed: boolean;
    randomSeed: number;
    isTimestampFixed: boolean;
    testTimestamp: Date | null;
    numRandomTests: number;
    targetSheetName?: string | null;
    file?: {
      name: string;
      url: string;
      file?: File | null;
    };
    variables?: CellRandomConfig[];
  };
}

export interface ExistingSpreadsheet {
  filename: string;
  size: number;
  id: number;
}

export interface SolutionEntity extends SolutionData {
  toBeDeleted?: boolean;
  draft?: boolean;
}

export enum AttachmentType {
  NO_ATTACHMENT = 'no_attachment',
  SINGLE_ATTACHMENT = 'single_attachment',
  MULTIPLE_ATTACHMENT = 'multiple_attachment',
}

export const INITIAL_MAX_ATTACHMENTS = 3;
export const INITIAL_MAX_ATTACHMENT_SIZE = 10;

export interface TextResponseQuestionFormData extends QuestionFormData {
  attachmentType: AttachmentType;
  maxAttachments: number;
  maxAttachmentSize: number | null;
  isAttachmentRequired: boolean;
  hideText: boolean;
  templateText: string | null;
}

export interface TextResponseFormData extends AvailableSkills {
  solutions?: SolutionEntity[];
  questionType: 'file_upload' | 'text_response';
  isAssessmentAutograded: boolean;
  defaultMaxAttachmentSize: number;
  defaultMaxAttachments: number;
  question: TextResponseQuestionFormData;
}
export type TextResponseEditableFormData = Pick<
  TextResponseFormData,
  'question' | 'solutions'
>;

type TextResponseFormDataQuestion = TextResponseFormData['question'];

export interface TextResponseSpreadsheetPostData {
  id?: number;
  file?: File;
  is_randomization_enabled?: boolean;
  is_random_seed_fixed?: boolean;
  test_random_seed?: number | null;
  is_timestamp_fixed?: boolean;
  test_timestamp?: string | null;
  num_random_tests?: number;
  target_sheet_name?: string | null;
  variables?: string;
  _destroy?: boolean;
}

export interface TextResponseSolutionPostData {
  id?: SolutionEntity['id'];
  solution?: SolutionEntity['solution'];
  solution_type?: SolutionEntity['solutionType'];
  grade?: SolutionEntity['grade'];
  explanation?: SolutionEntity['explanation'];
  _destroy?: SolutionEntity['toBeDeleted'];
  test_spreadsheet_attributes: TextResponseSpreadsheetPostData | null;
}

export interface TextResponsePostData {
  question_text_response: {
    title?: TextResponseFormDataQuestion['title'];
    description?: TextResponseFormDataQuestion['description'];
    staff_only_comments?: TextResponseFormDataQuestion['staffOnlyComments'];
    maximum_grade: TextResponseFormDataQuestion['maximumGrade'];
    template_text: TextResponseFormDataQuestion['templateText'];
    max_attachments: TextResponseFormDataQuestion['maxAttachments'];
    max_attachment_size: TextResponseFormDataQuestion['maxAttachmentSize'];
    is_attachment_required: TextResponseFormDataQuestion['isAttachmentRequired'];
    hide_text: TextResponseFormDataQuestion['hideText'];
    question_assessment?: {
      skill_ids: TextResponseFormDataQuestion['skillIds'];
    };
    solutions_attributes: TextResponseSolutionPostData[] | null;
  };
}
