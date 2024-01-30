import { QuestionType } from '../../question';

import {
  AnswerBaseData,
  AnswerFieldBaseData,
  AnswerFieldBaseEntity,
} from './answer';

export interface PostPack {
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

export interface SelectedPostPack {
  forum: { id: string; name: string };
  topic: { id: number; title: string; isDeleted: boolean };
  corePost: PostPack;
  parentPost?: PostPack;
}

export interface ForumPostResponseFieldData extends AnswerFieldBaseData {
  answer_text: string;
  selected_post_packs: SelectedPostPack[];
}

export interface ForumPostResponseAnswerData extends AnswerBaseData {
  questionType: QuestionType.ForumPostResponse;
  fields: ForumPostResponseFieldData;
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
