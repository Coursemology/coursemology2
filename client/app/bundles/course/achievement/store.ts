import { produce } from 'immer';
import {
  AchievementCourseUserData,
  AchievementData,
  AchievementListData,
  AchievementPermissions,
} from 'types/course/achievements';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  AchievementsActionType,
  AchievementsState,
  DELETE_ACHIEVEMENT,
  DeleteAchievementAction,
  SAVE_ACHIEVEMENT,
  SAVE_ACHIEVEMENT_COURSE_USERS,
  SAVE_ACHIEVEMENT_LIST,
  SaveAchievementAction,
  SaveAchievementCourseUserAction,
  SaveAchievementListAction,
} from './types';

const initialState: AchievementsState = {
  achievements: createEntityStore(),
  permissions: { canCreate: false, canManage: false, canReorder: false },
};

const reducer = produce(
  (draft: AchievementsState, action: AchievementsActionType) => {
    switch (action.type) {
      case SAVE_ACHIEVEMENT_LIST: {
        const achievementList = action.achievementList;
        const entityList = achievementList.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.achievements, entityList);
        draft.permissions = action.achievementPermissions;
        break;
      }
      case SAVE_ACHIEVEMENT: {
        const achievementData = action.achievement;
        const achievementEntity = { ...achievementData };
        saveEntityToStore(draft.achievements, achievementEntity);
        break;
      }
      case DELETE_ACHIEVEMENT: {
        const achievementId = action.id;
        if (draft.achievements.byId[achievementId]) {
          removeFromStore(draft.achievements, achievementId);
        }
        break;
      }
      case SAVE_ACHIEVEMENT_COURSE_USERS: {
        const achievementId = action.id;
        const achievementUsers = action.achievementCourseUsers;
        const achievementUsersEntity = achievementUsers.map((data) => ({
          ...data,
        }));

        // @ts-ignore: ignore other existing AchievementEntity contents as they are already saved
        saveEntityToStore(draft.achievements, {
          id: achievementId,
          achievementUsers: achievementUsersEntity,
        });
        break;
      }
      default: {
        break;
      }
    }
  },
  initialState,
);

export const actions = {
  saveAchievementList: (
    achievementList: AchievementListData[],
    achievementPermissions: AchievementPermissions,
  ): SaveAchievementListAction => {
    return {
      type: SAVE_ACHIEVEMENT_LIST,
      achievementList,
      achievementPermissions,
    };
  },

  saveAchievement: (achievement: AchievementData): SaveAchievementAction => {
    return {
      type: SAVE_ACHIEVEMENT,
      achievement,
    };
  },

  deleteAchievement: (achievementId: number): DeleteAchievementAction => {
    return {
      type: DELETE_ACHIEVEMENT,
      id: achievementId,
    };
  },

  saveAchievementCourseUsers: (
    achievementId: number,
    achievementCourseUsers: AchievementCourseUserData[],
  ): SaveAchievementCourseUserAction => {
    return {
      type: SAVE_ACHIEVEMENT_COURSE_USERS,
      id: achievementId,
      achievementCourseUsers,
    };
  },
};

export default reducer;
