import { QuestionType } from '../../question';

import {
  AnswerBaseData,
  AnswerFieldBaseData,
  AnswerFieldBaseEntity,
} from './answer';

// BE Data Type

export interface ScribingFieldData extends AnswerFieldBaseData {}

export interface ScribingAnswerData extends AnswerBaseData {
  questionType: QuestionType.Scribing;
  fields: ScribingFieldData;
  explanation: {
    correct: boolean | null;
    explanations: string[];
  };
  scribing_answer: {
    image_url: string;
    user_id: number;
    answer_id: number;
    scribbles: { content: string; creator_name: string; creator_id: number }[];
  };
}

// FE Data Type

export interface ScribingFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.Scribing;
}
