import { produce } from 'immer';
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { EnrolRequestListData } from 'types/course/enrolRequests';
import {
  createEntityStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  EnrolRequestsActionType,
  EnrolRequestsState,
  SAVE_ENROL_REQUEST_LIST,
  SaveEnrolRequestListAction,
  UPDATE_ENROL_REQUEST,
  UpdateEnrolRequestAction,
} from './types';

const initialState: EnrolRequestsState = {
  enrolRequests: createEntityStore(),
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
};

const reducer = produce(
  (draft: EnrolRequestsState, action: EnrolRequestsActionType) => {
    switch (action.type) {
      case SAVE_ENROL_REQUEST_LIST: {
        const enrolRequestsList = action.enrolRequestList;
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
        const enrolRequestMiniEntity = { ...enrolRequest };
        saveEntityToStore(draft.enrolRequests, enrolRequestMiniEntity);
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

export const actions = {
  saveEnrolRequestList: (
    enrolRequestList: EnrolRequestListData[],
    manageCourseUsersPermissions: ManageCourseUsersPermissions,
    manageCourseUsersData: ManageCourseUsersSharedData,
  ): SaveEnrolRequestListAction => {
    return {
      type: SAVE_ENROL_REQUEST_LIST,
      enrolRequestList,
      manageCourseUsersPermissions,
      manageCourseUsersData,
    };
  },

  updateEnrolRequest: (
    enrolRequest: EnrolRequestListData,
  ): UpdateEnrolRequestAction => {
    return {
      type: UPDATE_ENROL_REQUEST,
      enrolRequest,
    };
  },
};

export default reducer;
