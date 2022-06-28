import { produce } from 'immer';
import {
  createEntityStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';
import {
  EnrolRequestsActionType,
  EnrolRequestsState,
  SAVE_ENROL_REQUESTS_LIST,
  UPDATE_ENROL_REQUEST,
} from './types';

const initialState: EnrolRequestsState = {
  enrolRequests: createEntityStore(),
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
};

const reducer = produce(
  (draft: EnrolRequestsState, action: EnrolRequestsActionType) => {
    switch (action.type) {
      case SAVE_ENROL_REQUESTS_LIST: {
        const enrolRequestsList = action.enrolRequestsList;
        const entityList = enrolRequestsList.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.enrolRequests, entityList);
        draft.permissions = action.manageCourseUsersPermissions;
        draft.manageCourseUsersData = action.manageCourseUsersData;
        break;
      }
      case UPDATE_ENROL_REQUEST: {
        const enrolRequest = action.enrolRequest;
        const enrolRequestEntity = { ...enrolRequest };
        saveEntityToStore(draft.enrolRequests, enrolRequestEntity);
        draft.manageCourseUsersData.requestsCount -= 1;
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
