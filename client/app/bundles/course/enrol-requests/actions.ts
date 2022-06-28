import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { EnrolRequestListData } from 'types/course/enrolRequests';
import {
  SAVE_ENROL_REQUESTS_LIST,
  UPDATE_ENROL_REQUEST,
  SaveEnrolRequestsListAction,
  UpdateEnrolRequestAction,
} from './types';

export function saveEnrolRequestsList(
  enrolRequestsList: EnrolRequestListData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
  manageCourseUsersData: ManageCourseUsersSharedData,
): SaveEnrolRequestsListAction {
  return {
    type: SAVE_ENROL_REQUESTS_LIST,
    enrolRequestsList,
    manageCourseUsersPermissions,
    manageCourseUsersData,
  };
}

export function updateEnrolRequest(
  enrolRequest: EnrolRequestListData,
): UpdateEnrolRequestAction {
  return {
    type: UPDATE_ENROL_REQUEST,
    enrolRequest,
  };
}
