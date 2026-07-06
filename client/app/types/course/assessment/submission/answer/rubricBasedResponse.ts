import { JobStatusResponse } from 'types/jobs';

import { QuestionType } from '../../question';

import {
  AnswerBaseData,
  AnswerFieldBaseData,
  AnswerFieldBaseEntity,
} from './answer';

// BE Data Type

export interface RubricBasedResponseFieldData extends AnswerFieldBaseData {
  answer_text: string;
}

export interface RubricBasedResponseAnswerData extends AnswerBaseData {
  questionType: QuestionType.RubricBasedResponse;
  fields: RubricBasedResponseFieldData;
  explanation?: {
    correct: boolean | null;
    explanations: string[];
  };
  autograding?: JobStatusResponse & {
    path?: string;
  };
  latestAnswer?: RubricBasedResponseAnswerData;
}

// FE Data Type
export interface RubricBasedResponseFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.RubricBasedResponse;
  answer_text: string;
}
