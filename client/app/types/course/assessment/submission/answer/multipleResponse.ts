import { QuestionType } from '../../question';

import {
  AnswerBaseData,
  AnswerFieldBaseData,
  AnswerFieldBaseEntity,
} from './answer';

// BE Data Type

export interface MultipleResponseFieldData extends AnswerFieldBaseData {
  option_ids: number[];
}

export interface MultipleResponseAnswerData extends AnswerBaseData {
  questionType: QuestionType.MultipleResponse;
  fields: MultipleResponseFieldData;
  explanation: {
    correct?: boolean | null;
    explanations?: string[];
  };
  latestAnswer?: MultipleResponseAnswerData;
}

export interface MultipleChoiceFieldData extends AnswerFieldBaseData {
  option_ids: number[];
}

export interface MultipleChoiceAnswerData extends AnswerBaseData {
  questionType: QuestionType.MultipleChoice;
  fields: MultipleChoiceFieldData;
  explanation: {
    correct?: boolean | null;
    explanations?: string[];
  };
  latestAnswer?: MultipleChoiceAnswerData;
}

// FE Data Type

export interface MultipleResponseFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.MultipleResponse;
  option_ids: number[];
}

export interface MultipleChoiceFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.MultipleChoice;
  option_ids: number[];
}
