import { produce } from 'immer';
import {
  AnnouncementData,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { CourseListData, CourseStats } from 'types/system/courses';
import { InstanceListData, InstancePermissions } from 'types/system/instances';
import { AdminStats, UserListData } from 'types/users';
import {
  createEntityStore,
  removeAllFromStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  AdminActionType,
  AdminState,
  DELETE_ANNOUNCEMENT,
  DELETE_COURSE,
  DELETE_INSTANCE,
  DELETE_USER,
  DeleteAnnouncementAction,
  DeleteCourseAction,
  DeleteInstanceAction,
  DeleteUserAction,
  SAVE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENT_LIST,
  SAVE_COURSE_LIST,
  SAVE_INSTANCE,
  SAVE_INSTANCE_LIST,
  SAVE_USER,
  SAVE_USER_LIST,
  SaveAnnouncementAction,
  SaveAnnouncementListAction,
  SaveCourseListAction,
  SaveInstanceAction,
  SaveInstanceListAction,
  SaveUserAction,
  SaveUserListAction,
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
    canCreateAnnouncement: false,
    canCreateInstances: false,
  },
};

const reducer = produce((draft: AdminState, action: AdminActionType) => {
  switch (action.type) {
    case SAVE_ANNOUNCEMENT_LIST: {
      const announcementList = action.announcementList;
      const entityList = announcementList.map((data) => ({ ...data }));
      removeAllFromStore(draft.announcements);
      saveListToStore(draft.announcements, entityList);
      draft.permissions.canCreateAnnouncement =
        action.announcementPermissions.canCreate;
      break;
    }
    case SAVE_ANNOUNCEMENT: {
      const announcementData = action.announcement;
      const announcementEntity = { ...announcementData };
      saveEntityToStore(draft.announcements, announcementEntity);
      break;
    }
    case DELETE_ANNOUNCEMENT: {
      const announcementId = action.id;
      if (draft.announcements.byId[announcementId]) {
        removeFromStore(draft.announcements, announcementId);
      }
      break;
    }
    case SAVE_USER_LIST: {
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

export const actions = {
  saveAnnouncementList: (
    announcementList: AnnouncementData[],
    announcementPermissions: AnnouncementPermissions,
  ): SaveAnnouncementListAction => {
    return {
      type: SAVE_ANNOUNCEMENT_LIST,
      announcementList,
      announcementPermissions,
    };
  },
  saveAnnouncement: (
    announcement: AnnouncementData,
  ): SaveAnnouncementAction => {
    return { type: SAVE_ANNOUNCEMENT, announcement };
  },
  deleteAnnouncement: (announcementId: number): DeleteAnnouncementAction => {
    return {
      type: DELETE_ANNOUNCEMENT,
      id: announcementId,
    };
  },
  saveUserList: (
    userList: UserListData[],
    counts: AdminStats,
  ): SaveUserListAction => {
    return {
      type: SAVE_USER_LIST,
      userList,
      counts,
    };
  },
  saveUser: (user: UserListData): SaveUserAction => {
    return {
      type: SAVE_USER,
      user,
    };
  },
  deleteUser: (id: number): DeleteUserAction => {
    return {
      type: DELETE_USER,
      id,
    };
  },
  saveCourseList: (
    courseList: CourseListData[],
    counts: CourseStats,
  ): SaveCourseListAction => {
    return {
      type: SAVE_COURSE_LIST,
      courseList,
      counts,
    };
  },
  deleteCourse: (courseId: number): DeleteCourseAction => {
    return {
      type: DELETE_COURSE,
      id: courseId,
    };
  },
  saveInstanceList: (
    instanceList: InstanceListData[],
    permissions: InstancePermissions,
    count: number,
  ): SaveInstanceListAction => {
    return {
      type: SAVE_INSTANCE_LIST,
      instanceList,
      permissions,
      count,
    };
  },
  saveInstance: (instance: InstanceListData): SaveInstanceAction => {
    return {
      type: SAVE_INSTANCE,
      instance,
    };
  },
  deleteInstance: (instanceId: number): DeleteInstanceAction => {
    return {
      type: DELETE_INSTANCE,
      id: instanceId,
    };
  },
};

export default reducer;
