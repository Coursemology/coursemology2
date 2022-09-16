import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { EnrolRequestListData } from 'types/course/enrolRequests';
import {
  SAVE_ENROL_REQUEST_LIST,
  UPDATE_ENROL_REQUEST,
  SaveEnrolRequestListAction,
  UpdateEnrolRequestAction,
} from './types';

export function saveEnrolRequestList(
  enrolRequestList: EnrolRequestListData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
  manageCourseUsersData: ManageCourseUsersSharedData,
): SaveEnrolRequestListAction {
  return {
    type: SAVE_ENROL_REQUEST_LIST,
    enrolRequestList,
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
