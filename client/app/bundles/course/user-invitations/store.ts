import { produce } from 'immer';
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { InvitationListData } from 'types/course/userInvitations';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  DELETE_INVITATION,
  DeleteInvitationAction,
  InvitationsActionType,
  InvitationsState,
  SAVE_COURSE_REGISTRATION_KEY,
  SAVE_INVITATION_LIST,
  SAVE_PERMISSIONS,
  SAVE_SHARED_DATA,
  SaveCourseRegistrationKeyAction,
  SaveInvitationListAction,
  SavePermissionsAction,
  SaveSharedDataAction,
  UPDATE_INVITATION,
  UPDATE_INVITATION_COUNTS,
  UPDATE_INVITATION_LIST,
  UpdateInvitationAction,
  UpdateInvitationCountsAction,
  UpdateInvitationListAction,
} from './types';

const initialState: InvitationsState = {
  invitations: createEntityStore(),
  permissions: {
    canManageCourseUsers: false,
    canManageEnrolRequests: false,
    canManageReferenceTimelines: false,
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

export const actions = {
  saveInvitationList: (
    invitationList: InvitationListData[],
    manageCourseUsersPermissions: ManageCourseUsersPermissions,
    manageCourseUsersData: ManageCourseUsersSharedData,
  ): SaveInvitationListAction => {
    return {
      type: SAVE_INVITATION_LIST,
      invitationList,
      manageCourseUsersPermissions,
      manageCourseUsersData,
    };
  },

  deleteInvitation: (invitationId: number): DeleteInvitationAction => {
    return {
      type: DELETE_INVITATION,
      invitationId,
    };
  },

  saveRegistrationKey: (
    courseRegistrationKey: string,
  ): SaveCourseRegistrationKeyAction => {
    return {
      type: SAVE_COURSE_REGISTRATION_KEY,
      courseRegistrationKey,
    };
  },

  savePermissions: (
    manageCourseUsersPermissions: ManageCourseUsersPermissions,
  ): SavePermissionsAction => {
    return {
      type: SAVE_PERMISSIONS,
      manageCourseUsersPermissions,
    };
  },

  saveSharedData: (
    manageCourseUsersData: ManageCourseUsersSharedData,
  ): SaveSharedDataAction => {
    return {
      type: SAVE_SHARED_DATA,
      manageCourseUsersData,
    };
  },

  updateInvitation: (
    invitation: InvitationListData,
  ): UpdateInvitationAction => {
    return {
      type: UPDATE_INVITATION,
      invitation,
    };
  },

  updateInvitationList: (
    invitationList: InvitationListData[],
  ): UpdateInvitationListAction => {
    return {
      type: UPDATE_INVITATION_LIST,
      invitationList,
    };
  },

  updateInvitationCounts: (
    newInvitations: number,
  ): UpdateInvitationCountsAction => {
    return {
      type: UPDATE_INVITATION_COUNTS,
      newInvitations,
    };
  },
};

export default reducer;
