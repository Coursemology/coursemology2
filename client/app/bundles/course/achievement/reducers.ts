import { produce } from 'immer';
import {
  AchievementCourseUserEntity,
  AchievementEntity,
  AchievementMiniEntity,
} from 'types/course/achievements';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import * as types from './types';

const initialState: types.AchievementsState = {
  achievements: createEntityStore(),
  permissions: { canCreate: false, canManage: false, canReorder: false },
};

const reducer = produce(
  (draft: types.AchievementsState, action: types.AchievementsActionType) => {
    switch (action.type) {
      case types.SAVE_ACHIEVEMENT_LIST: {
        const achievementList = action.achievementList;
        const entityList: AchievementMiniEntity[] = achievementList.map(
          (data) => ({
            ...data,
          }),
        );
        saveListToStore(draft.achievements, entityList);
        draft.permissions = action.achievementPermissions;
        break;
      }
      case types.SAVE_ACHIEVEMENT: {
        const achievementData = action.achievement;
        const achievementEntity: AchievementEntity = { ...achievementData };
        saveEntityToStore(draft.achievements, achievementEntity);
        break;
      }
      case types.DELETE_ACHIEVEMENT: {
        const achievementId = action.id;
        if (draft.achievements.byId[achievementId]) {
          removeFromStore(draft.achievements, achievementId);
        }
        break;
      }
      case types.SAVE_ACHIEVEMENT_COURSE_USERS: {
        const achievementId = action.id;
        const achievementUsers = action.achievementCourseUsers;
        const achievementUsersEntity: AchievementCourseUserEntity[] =
          achievementUsers.map((data) => ({
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

export default reducer;
