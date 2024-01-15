import { QuestionType } from '../../question';

import {
  AnswerBaseData,
  AnswerFieldBaseData,
  AnswerFieldBaseEntity,
} from './answer';

interface PostPack {
  id: number;
  text: string;
  creatorId: number;
  updatedAt: string;
  isUpdated: boolean;
  isDeleted: boolean;
  userName: string;
  avatar?: string;
}

// BE Data Type

interface ForumPostResponseFieldData extends AnswerFieldBaseData {
  answer_text: string;
}

export interface ForumPostResponseAnswerData extends AnswerBaseData {
  questionType: QuestionType.ForumPostResponse;
  fields: ForumPostResponseFieldData;
  selected_post_packs: {
    forum: { id: string; name: string };
    topic: { id: number; title: string; isDeleted: boolean };
    corePost: PostPack;
    parentPost?: PostPack;
  };
  explanation: {
    correct: boolean | null;
    explanations: string[];
  };
}

// FE Data Type

export interface ForumPostResponseFieldEntity extends AnswerFieldBaseEntity {
  questionType: QuestionType.ForumPostResponse;
  answer_text: string;
}
