import { produce } from 'immer';
import { InstanceBasicListData } from 'types/system/instances';
import { UserBasicListData, UserCourseListData } from 'types/users';
import { createEntityStore, saveListToStore } from 'utilities/store';

import {
  GlobalActionType,
  GlobalUserState,
  SAVE_COURSE_LIST,
  SAVE_INSTANCE_LIST,
  SAVE_USER,
  SaveCourseListAction,
  SaveInstanceListAction,
  SaveUserAction,
} from './types';

const initialState: GlobalUserState = {
  user: {
    id: 0,
    name: '',
    imageUrl: '',
  },
  currentCourses: createEntityStore(),
  completedCourses: createEntityStore(),
  instances: createEntityStore(),
};

const reducer = produce((draft: GlobalUserState, action: GlobalActionType) => {
  switch (action.type) {
    case SAVE_USER: {
      const userData = action.user;
      const userEntity = { ...userData };
      draft.user = userEntity;
      break;
    }
    case SAVE_COURSE_LIST: {
      if (action.courses) {
        const coursesList = action.courses;
        const entityList = coursesList.map((data) => ({
          ...data,
        }));
        if (action.courseType === 'current') {
          saveListToStore(draft.currentCourses, entityList);
        } else {
          saveListToStore(draft.completedCourses, entityList);
        }
      }
      break;
    }
    case SAVE_INSTANCE_LIST: {
      if (action.instances) {
        const instancesList = action.instances;
        const entityList = instancesList.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.instances, entityList);
      }
      break;
    }
    default:
      break;
  }
}, initialState);

export const actions = {
  saveUser: (user: UserBasicListData): SaveUserAction => {
    return { type: SAVE_USER, user };
  },

  saveCourses: (
    courses: UserCourseListData[],
    courseType: 'current' | 'completed',
  ): SaveCourseListAction => {
    return { type: SAVE_COURSE_LIST, courses, courseType };
  },

  saveInstances: (
    instances: InstanceBasicListData[],
  ): SaveInstanceListAction => {
    return { type: SAVE_INSTANCE_LIST, instances };
  },
};

export default reducer;
