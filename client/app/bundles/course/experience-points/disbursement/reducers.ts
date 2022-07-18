import { produce } from 'immer';
import {
  ForumDisbursementFilters,
  ForumPostEntity,
} from 'types/course/disbursement';

import {
  createEntityStore,
  removeAllFromStore,
  saveListToStore,
} from 'utilities/store';
import {
  SAVE_DISBURSEMENT_LIST,
  DisbursementActionType,
  DisbursementState,
  SAVE_FORUM_DISBURSEMENT_LIST,
  SAVE_FORUM_POST_LIST,
} from './types';

const initialState: DisbursementState = {
  courseGroups: createEntityStore(),
  courseUsers: createEntityStore(),
  currentGroup: null,
  filters: {} as ForumDisbursementFilters,
  forumUsers: createEntityStore(),
  forumPosts: createEntityStore(),
};

const reducer = produce(
  (draft: DisbursementState, action: DisbursementActionType) => {
    switch (action.type) {
      case SAVE_DISBURSEMENT_LIST: {
        const courseGroups = action.courseGroups.map((data) => ({
          ...data,
        }));
        const courseUsers = action.courseUsers.map((data) => ({
          ...data,
        }));
        const currentGroup = action.currentGroup && { ...action.currentGroup };

        saveListToStore(draft.courseGroups, courseGroups);
        saveListToStore(draft.courseUsers, courseUsers);
        draft.currentGroup = currentGroup ?? null;
        break;
      }
      case SAVE_FORUM_DISBURSEMENT_LIST: {
        const filters = { ...action.filters };
        const forumUsersData = action.forumUsers;
        const forumUserEntity = forumUsersData.map((data) => ({
          ...data,
        }));

        removeAllFromStore(draft.forumUsers);
        removeAllFromStore(draft.forumPosts);
        saveListToStore(draft.forumUsers, forumUserEntity);
        draft.filters = filters;
        break;
      }
      case SAVE_FORUM_POST_LIST: {
        const forumPostEntity: ForumPostEntity[] = action.posts.map((data) => ({
          ...data,
          userId: action.userId,
        }));
        saveListToStore(draft.forumPosts, forumPostEntity);
        break;
      }
      default: {
        break;
      }
    }
  },
  initialState,
);

export default reducer;
