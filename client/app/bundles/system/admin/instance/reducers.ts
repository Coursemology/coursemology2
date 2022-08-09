import { produce } from 'immer';
import {
  ComponentMiniEntity,
  InstanceComponent,
} from 'types/system/instance/components';
import {
  createEntityStore,
  removeAllFromStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import {
  InstanceAdminActionType,
  InstanceAdminState,
  DELETE_ANNOUNCEMENT,
  DELETE_COURSE,
  DELETE_INVITATION,
  DELETE_USER,
  SAVE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENTS_LIST,
  SAVE_COMPONENTS_LIST,
  SAVE_COURSE_LIST,
  SAVE_INSTANCE,
  SAVE_ROLE_REQUESTS_LIST,
  SAVE_USER,
  SAVE_USERS_LIST,
  SAVE_USER_INVITATIONS_LIST,
  UPDATE_INVITATION,
  UPDATE_INVITATION_LIST,
  UPDATE_ROLE_REQUEST,
} from './types';

const initialState: InstanceAdminState = {
  announcements: createEntityStore(),
  users: createEntityStore(),
  courses: createEntityStore(),
  components: createEntityStore(),
  roleRequests: createEntityStore(),
  invitations: createEntityStore(),
  instance: {
    id: 0,
    name: '',
  },
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
    canCreateInstances: false,
  },
};

const reducer = produce(
  (draft: InstanceAdminState, action: InstanceAdminActionType) => {
    switch (action.type) {
      case SAVE_INSTANCE: {
        const instanceData = action.instance;
        const instanceEntity = { ...instanceData };
        draft.instance = instanceEntity;
        break;
      }
      case SAVE_ANNOUNCEMENTS_LIST: {
        const announcementList = action.announcementList;
        const entityList = announcementList.map((data) => ({ ...data }));
        removeAllFromStore(draft.announcements);
        saveListToStore(draft.announcements, entityList);
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
      case UPDATE_INVITATION: {
        const newInvitation = action.invitation;
        const invitationEntity = { ...newInvitation };
        saveEntityToStore(draft.invitations, invitationEntity);
        break;
      }
      case UPDATE_INVITATION_LIST: {
        const invitationList = action.invitationList;
        const entityList = invitationList.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.invitations, entityList);
        break;
      }
      case DELETE_INVITATION: {
        const invitationId = action.invitationId;
        if (draft.invitations.byId[invitationId]) {
          removeFromStore(draft.invitations, invitationId);
        }
        break;
      }
      case SAVE_USER_INVITATIONS_LIST: {
        const invitationsList = action.invitations;
        const entityList = invitationsList.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.invitations, entityList);
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
      case SAVE_COMPONENTS_LIST: {
        const componentsListData = action.componentsList;
        const componentsList: InstanceComponent[] = [];

        componentsListData.enabled?.forEach((component) => {
          componentsList.push({ ...component, enabled: true });
        });
        componentsListData.disabled?.forEach((component) => {
          componentsList.push({
            ...component,
            enabled: false,
          });
        });

        // alphabetically
        componentsList.sort((a, b) => (a.name < b.name ? -1 : 1));

        const entityList: ComponentMiniEntity[] = componentsList.map(
          (component, index): ComponentMiniEntity => {
            return { ...component, id: index };
          },
        );

        saveListToStore(draft.components, entityList);
        break;
      }
      case SAVE_ROLE_REQUESTS_LIST: {
        const roleRequestsList = action.roleRequests;
        const entityList = roleRequestsList.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.roleRequests, entityList);
        break;
      }
      case UPDATE_ROLE_REQUEST: {
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
