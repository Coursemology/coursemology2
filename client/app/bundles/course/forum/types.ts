import { EntityState } from '@reduxjs/toolkit';
import {
  ForumEntity,
  ForumMetadata,
  ForumPermissions,
  ForumTopicEntity,
  ForumTopicPostEntity,
} from 'types/course/forums';

// State Types

export interface ForumsState {
  forumTitle: string;
  forums: EntityState<ForumEntity>;
  topics: EntityState<ForumTopicEntity>;
  posts: EntityState<ForumTopicPostEntity>;
  metadata: ForumMetadata;
  permissions: ForumPermissions;
}
