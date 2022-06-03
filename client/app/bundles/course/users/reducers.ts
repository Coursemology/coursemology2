import { produce } from 'immer';
import {
  CourseUserEntity,
  CourseUserMiniEntity,
} from 'types/course/course_users';
import {
  createEntityStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import {
  UsersState,
  UsersActionType,
  SAVE_USER,
  SAVE_USERS_LIST,
} from './types';

const initialState: UsersState = {
  users: createEntityStore(),
};

const reducer = produce((draft: UsersState, action: UsersActionType) => {
  switch (action.type) {
    case SAVE_USERS_LIST: {
      const userList = action.userList;
      const entityList: CourseUserMiniEntity[] = userList.map((data) => ({
        ...data,
      }));
      saveListToStore(draft.users, entityList);
      break;
    }
    case SAVE_USER: {
      const userData = action.user;
      const userEntity: CourseUserEntity = { ...userData };
      saveEntityToStore(draft.users, userEntity);
      break;
    }
    default: {
      break;
    }
  }
}, initialState);

export default reducer;
