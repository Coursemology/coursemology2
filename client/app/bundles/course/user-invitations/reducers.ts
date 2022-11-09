import { produce } from 'immer';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  DELETE_INVITATION,
  InvitationsActionType,
  InvitationsState,
  SAVE_COURSE_REGISTRATION_KEY,
  SAVE_INVITATION_LIST,
  SAVE_PERMISSIONS,
  SAVE_SHARED_DATA,
  UPDATE_INVITATION,
  UPDATE_INVITATION_COUNTS,
  UPDATE_INVITATION_LIST,
} from './types';

const initialState: InvitationsState = {
  invitations: createEntityStore(),
  permissions: {
    canManageCourseUsers: false,
    canManageEnrolRequests: false,
    canManagePersonalTimes: false,
    canRegisterWithCode: false,
  },
  manageCourseUsersData: {
    requestsCount: 0,
    invitationsCount: 0,
    defaultTimelineAlgorithm: 'fixed',
  },
  courseRegistrationKey: '',
};

const reducer = produce(
  (draft: InvitationsState, action: InvitationsActionType) => {
    switch (action.type) {
      case SAVE_INVITATION_LIST: {
        const invitationList = action.invitationList;
        const entityList = invitationList.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.invitations, entityList);
        draft.permissions = action.manageCourseUsersPermissions;
        draft.manageCourseUsersData = action.manageCourseUsersData;
        break;
      }
      case DELETE_INVITATION: {
        const invitationId = action.invitationId;
        if (draft.invitations.byId[invitationId]) {
          removeFromStore(draft.invitations, invitationId);
          const updated = {
            ...draft.manageCourseUsersData,
            invitationsCount: draft.manageCourseUsersData.invitationsCount - 1,
          };
          draft.manageCourseUsersData = updated;
        }
        break;
      }
      case SAVE_COURSE_REGISTRATION_KEY: {
        draft.courseRegistrationKey = action.courseRegistrationKey;
        break;
      }
      case SAVE_PERMISSIONS: {
        draft.permissions = action.manageCourseUsersPermissions;
        break;
      }
      case SAVE_SHARED_DATA: {
        draft.manageCourseUsersData = action.manageCourseUsersData;
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
      case UPDATE_INVITATION_COUNTS: {
        const newInvitations = action.newInvitations;
        const updated = {
          ...draft.manageCourseUsersData,
          invitationsCount:
            draft.manageCourseUsersData.invitationsCount + newInvitations,
        };
        draft.manageCourseUsersData = updated;
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
