import { produce } from 'immer';
import { InvitationEntity } from 'types/course/userInvitations';
import {
  createEntityStore,
  removeFromStore,
  saveDetailedListToStore,
} from 'utilities/store';
import {
  DELETE_INVITATION,
  InvitationsActionType,
  InvitationsState,
  SAVE_COURSE_REGISTRATION_KEY,
  SAVE_INVITATION_LIST,
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
        const entityList: InvitationEntity[] = invitationList.map((data) => ({
          ...data,
        }));
        saveDetailedListToStore(draft.invitations, entityList);
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
      default: {
        break;
      }
    }
  },
  initialState,
);

export default reducer;
