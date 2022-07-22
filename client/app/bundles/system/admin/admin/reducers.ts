import { produce } from 'immer';
import {
  createEntityStore,
  removeAllFromStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import {
  AdminState,
  AdminActionType,
  SAVE_ANNOUNCEMENTS_LIST,
  DELETE_ANNOUNCEMENT,
  SAVE_USERS_LIST,
  SAVE_COURSE_LIST,
  SAVE_INSTANCE_LIST,
  DELETE_COURSE,
  SAVE_ANNOUNCEMENT,
  SAVE_USER,
  DELETE_USER,
  SAVE_INSTANCE,
  DELETE_INSTANCE,
} from './types';

const initialState: AdminState = {
  announcements: createEntityStore(),
  users: createEntityStore(),
  counts: {
    totalUsers: {
      adminCount: 0,
      normalCount: 0,
      allCount: 0,
    },
    activeUsers: {
      adminCount: 0,
      normalCount: 0,
      allCount: 0,
    },
    coursesCount: 0,
    usersCount: 0,
    totalCourses: 0,
    activeCourses: 0,
    instancesCount: 0,
  },
  instances: createEntityStore(),
  courses: createEntityStore(),
  permissions: {
    canCreateInstances: false,
  },
};

const reducer = produce((draft: AdminState, action: AdminActionType) => {
  switch (action.type) {
    case SAVE_ANNOUNCEMENTS_LIST: {
      const announcementList = action.announcementList;
      const entityList = announcementList.map((data) => ({ ...data }));
      removeAllFromStore(draft.announcements);
      saveListToStore(draft.announcements, entityList);
      break;
    }
    case DELETE_ANNOUNCEMENT: {
      const announcementId = action.id;
      if (draft.announcements.byId[announcementId]) {
        removeFromStore(draft.announcements, announcementId);
      }
      break;
    }
    case SAVE_ANNOUNCEMENT: {
      const announcementData = action.announcement;
      const announcementEntity = { ...announcementData };
      saveEntityToStore(draft.announcements, announcementEntity);
      break;
    }
    case SAVE_USERS_LIST: {
      const userList = action.userList;
      const counts = action.counts;
      const entityList = userList.map((data) => ({
        ...data,
      }));
      removeAllFromStore(draft.users);
      saveListToStore(draft.users, entityList);
      draft.counts = { ...draft.counts, ...counts };
      break;
    }
    case SAVE_USER: {
      const userData = action.user;
      const userEntity = { ...userData };
      saveEntityToStore(draft.users, userEntity);
      break;
    }
    case DELETE_USER: {
      const userId = action.id;
      if (draft.users.byId[userId]) {
        removeFromStore(draft.users, userId);
      }
      break;
    }
    case SAVE_COURSE_LIST: {
      const courseList = action.courseList;
      const counts = action.counts;
      const entityList = courseList.map((data) => ({
        ...data,
      }));
      removeAllFromStore(draft.courses);
      saveListToStore(draft.courses, entityList);
      draft.counts = { ...draft.counts, ...counts };
      break;
    }
    case DELETE_COURSE: {
      const courseId = action.id;
      if (draft.courses.byId[courseId]) {
        removeFromStore(draft.courses, courseId);
      }
      draft.counts.totalCourses -= 1;
      break;
    }
    case SAVE_INSTANCE_LIST: {
      const instanceList = action.instanceList;
      const entityList = instanceList.map((data) => ({
        ...data,
      }));
      removeAllFromStore(draft.instances);
      saveListToStore(draft.instances, entityList);
      draft.counts.instancesCount = action.count;
      draft.permissions = action.permissions;
      break;
    }
    case SAVE_INSTANCE: {
      const instanceData = action.instance;
      const instanceEntity = { ...instanceData };
      saveEntityToStore(draft.instances, instanceEntity);
      break;
    }
    case DELETE_INSTANCE: {
      const instanceId = action.id;
      if (draft.instances.byId[instanceId]) {
        removeFromStore(draft.instances, instanceId);
      }
      draft.counts.instancesCount -= 1;
      break;
    }
    default: {
      break;
    }
  }
}, initialState);

export default reducer;
