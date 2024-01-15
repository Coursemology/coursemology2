import {
  ForumPostResponseAnswerData,
  ForumPostResponseFieldEntity,
} from './forumPostResponse';
import {
  MultipleChoiceAnswerData,
  MultipleChoiceFieldEntity,
  MultipleResponseAnswerData,
  MultipleResponseFieldEntity,
} from './multipleResponse';
import { ProgrammingAnswerData, ProgrammingFieldEntity } from './programming';
import { ScribingAnswerData, ScribingFieldEntity } from './scribing';
import {
  FileUploadAnswerData,
  FileUploadFieldEntity,
  TextResponseAnswerData,
  TextResponseFieldEntity,
} from './textResponse';
import {
  VoiceResponseAnswerData,
  VoiceResponseFieldEntity,
} from './voiceResponse';

// BE Data Type

export type AnswerData =
  | MultipleChoiceAnswerData
  | MultipleResponseAnswerData
  | ProgrammingAnswerData
  | TextResponseAnswerData
  | FileUploadAnswerData
  | ScribingAnswerData
  | VoiceResponseAnswerData
  | ForumPostResponseAnswerData;

// FE Data Type

export type AnswerFieldEntity =
  | MultipleChoiceFieldEntity
  | MultipleResponseFieldEntity
  | ProgrammingFieldEntity
  | TextResponseFieldEntity
  | FileUploadFieldEntity
  | ScribingFieldEntity
  | VoiceResponseFieldEntity
  | ForumPostResponseFieldEntity;
