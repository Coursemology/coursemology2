import { produce } from 'immer';
import {
  createEntityStore,
  removeAllFromStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  DELETE_ANNOUNCEMENT,
  DELETE_COURSE,
  DELETE_INVITATION,
  DELETE_USER,
  InstanceAdminActionType,
  InstanceAdminState,
  SAVE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENT_LIST,
  SAVE_COURSE_LIST,
  SAVE_INVITATION,
  SAVE_INVITATION_LIST,
  SAVE_ROLE_REQUEST,
  SAVE_ROLE_REQUEST_LIST,
  SAVE_USER,
  SAVE_USER_LIST,
} from './types';

const initialState: InstanceAdminState = {
  announcements: createEntityStore(),
  users: createEntityStore(),
  courses: createEntityStore(),
  roleRequests: createEntityStore(),
  invitations: createEntityStore(),
  counts: {
    totalUsers: {
      adminCount: 0,
      instructorCount: 0,
      normalCount: 0,
      allCount: 0,
    },
    activeUsers: {
      adminCount: 0,
      instructorCount: 0,
      normalCount: 0,
      allCount: 0,
    },
    coursesCount: 0,
    usersCount: 0,
    totalCourses: 0,
    activeCourses: 0,
  },
  permissions: {
    canCreateAnnouncement: false,
    canCreateInstances: false,
  },
};

const reducer = produce(
  (draft: InstanceAdminState, action: InstanceAdminActionType) => {
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
      case SAVE_INVITATION_LIST: {
        const invitationList = action.invitationList;
        const entityList = invitationList.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.invitations, entityList);
        break;
      }
      case SAVE_INVITATION: {
        const newInvitation = action.invitation;
        const invitationEntity = { ...newInvitation };
        saveEntityToStore(draft.invitations, invitationEntity);
        break;
      }
      case DELETE_INVITATION: {
        const invitationId = action.invitationId;
        if (draft.invitations.byId[invitationId]) {
          removeFromStore(draft.invitations, invitationId);
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

      case SAVE_ROLE_REQUEST_LIST: {
        const roleRequestsList = action.roleRequests;
        const entityList = roleRequestsList.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.roleRequests, entityList);
        break;
      }
      case SAVE_ROLE_REQUEST: {
        const roleRequest = action.roleRequest;
        const roleRequestMiniEntity = { ...roleRequest };
        saveEntityToStore(draft.roleRequests, roleRequestMiniEntity);
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
