import { produce } from 'immer';
import {
  //   AchievementCourseUserEntity,
  //   UserEntity,
  UserMiniEntity,
} from 'types/course/users';
import {
  createEntityStore,
  //   removeFromStore,
  //   saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import { UsersState, UsersActionType, SAVE_USERS_LIST } from './types';

const initialState: UsersState = {
  users: createEntityStore(),
  permissions: { canCreate: false, canManage: false, canReorder: false },
};

const reducer = produce((draft: UsersState, action: UsersActionType) => {
  switch (action.type) {
    case SAVE_USERS_LIST: {
      const userList = action.userList;
      const entityList: UserMiniEntity[] = userList.map((data) => ({
        ...data,
      }));
      saveListToStore(draft.users, entityList);
      draft.permissions = action.userPermissions;
      break;
    }
    default: {
      break;
    }
  }
}, initialState);

export default reducer;
