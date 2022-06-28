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
export const SAVE_ENROL_REQUESTS_LIST =
  'course/enrolRequests/SAVE_ENROL_REQUESTS_LIST';
export const UPDATE_ENROL_REQUEST = 'course/enrolRequests/UPDATE_ENROL_REQUEST';

// Action Types
export interface SaveEnrolRequestsListAction {
  type: typeof SAVE_ENROL_REQUESTS_LIST;
  enrolRequestsList: EnrolRequestListData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
}
export interface UpdateEnrolRequestAction {
  type: typeof UPDATE_ENROL_REQUEST;
  enrolRequest: EnrolRequestListData;
}

export type EnrolRequestsActionType =
  | SaveEnrolRequestsListAction
  | UpdateEnrolRequestAction;

// State Types
export interface EnrolRequestsState {
  enrolRequests: EntityStore<EnrolRequestMiniEntity, EnrolRequestMiniEntity>;
  permissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
}
