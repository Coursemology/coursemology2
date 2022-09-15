import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import {
  EnrolRequestListData,
  EnrolRequestMiniEntity,
} from 'types/course/enrolRequests';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_ENROL_REQUEST_LIST =
  'course/enrolRequests/SAVE_ENROL_REQUEST_LIST';
export const UPDATE_ENROL_REQUEST = 'course/enrolRequests/UPDATE_ENROL_REQUEST';

// Action Types
export interface SaveEnrolRequestListAction {
  type: typeof SAVE_ENROL_REQUEST_LIST;
  enrolRequestList: EnrolRequestListData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
}
export interface UpdateEnrolRequestAction {
  type: typeof UPDATE_ENROL_REQUEST;
  enrolRequest: EnrolRequestListData;
}

export type EnrolRequestsActionType =
  | SaveEnrolRequestListAction
  | UpdateEnrolRequestAction;

// State Types
export interface EnrolRequestsState {
  enrolRequests: EntityStore<EnrolRequestMiniEntity, EnrolRequestMiniEntity>;
  permissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
}
