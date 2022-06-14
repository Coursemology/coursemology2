import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import {
  EnrolRequestData,
  EnrolRequestEntity,
} from 'types/course/enrolRequests';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_ENROL_REQUESTS_LIST =
  'course/enrolRequests/SAVE_ENROL_REQUESTS_LIST';
export const UPDATE_ENROL_REQUEST = 'course/enrolRequests/UPDATE_ENROL_REQUEST';

// Action Types
export interface SaveEnrolRequestsListAction {
  type: typeof SAVE_ENROL_REQUESTS_LIST;
  enrolRequestsList: EnrolRequestData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
}
export interface UpdateEnrolRequestAction {
  type: typeof UPDATE_ENROL_REQUEST;
  enrolRequest: EnrolRequestData;
}

export type EnrolRequestsActionType =
  | SaveEnrolRequestsListAction
  | UpdateEnrolRequestAction;

// State Types
export interface EnrolRequestsState {
  enrolRequests: EntityStore<EnrolRequestEntity, EnrolRequestEntity>;
  permissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
}
