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
  forums: EntityState<ForumEntity, number>;
  topics: EntityState<ForumTopicEntity, number>;
  posts: EntityState<ForumTopicPostEntity, number>;
  metadata: ForumMetadata;
  permissions: ForumPermissions;
}
