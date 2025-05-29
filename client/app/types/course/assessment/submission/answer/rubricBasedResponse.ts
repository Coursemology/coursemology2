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
  explanation: {
    correct: boolean | null;
    explanations: string[];
  };
  autograding?: JobStatusResponse & {
    path?: string;
  };
  latestAnswer?: RubricBasedResponseAnswerData;
  categoryScores: {
    canReadRubric: boolean;
    id: number | null | undefined;
    categoryId: number;
    score: number;
  }[];
}

// FE Data Type
export interface RubricBasedResponseFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.RubricBasedResponse;
  answer_text: string;
}
