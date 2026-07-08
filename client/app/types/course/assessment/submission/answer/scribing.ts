import { QuestionType } from '../../question';

import {
  AnswerBaseData,
  AnswerFieldBaseData,
  AnswerFieldBaseEntity,
} from './answer';

// BE Data Type

export interface ScribingFieldData extends AnswerFieldBaseData {}

export interface ScribingAnswerScribble {
  content: string;
  creator_name?: string;
  creator_id: number;
}

export interface ScribingAnswerContent {
  image_url: string;
  user_id: number;
  answer_id: number;
  scribbles: ScribingAnswerScribble[];
}

export interface ScribingAnswerData extends AnswerBaseData {
  questionType: QuestionType.Scribing;
  fields: ScribingFieldData;
  explanation?: {
    correct: boolean | null;
    explanations: string[];
  };
  scribing_answer: ScribingAnswerContent;
}

// FE Data Type

export interface ScribingFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.Scribing;
}
