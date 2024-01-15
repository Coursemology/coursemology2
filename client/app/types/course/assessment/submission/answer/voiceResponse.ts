import { QuestionType } from '../../question';

import {
  AnswerBaseData,
  AnswerFieldBaseData,
  AnswerFieldBaseEntity,
} from './answer';

// BE Data Type

interface VoiceResponseFieldData extends AnswerFieldBaseData {
  file: { url: string | null; name: string };
}

export interface VoiceResponseAnswerData extends AnswerBaseData {
  questionType: QuestionType.VoiceResponse;
  fields: VoiceResponseFieldData;
  explanation: {
    correct: boolean | null;
    explanations: string[];
  };
}

// FE Data Type

export interface VoiceResponseFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.VoiceResponse;
  file: { url: string | null; name: string };
}
