import { Operation } from 'store';
import {
  ApproveEnrolRequestPatchData,
  EnrolRequestMiniEntity,
} from 'types/course/enrolRequests';

import CourseAPI from 'api/course';

import { actions } from './store';

const formatAttributes = (
  data: EnrolRequestMiniEntity,
): ApproveEnrolRequestPatchData => {
  return {
    course_user: {
      name: data.name,
      phantom: data.phantom, // undefined if user doesn't change
      role: data.role, // undefined if user doesn't change
      timeline_algorithm: data.timelineAlgorithm, // undefined if user doesn't change
    },
  };
};

export function fetchEnrolRequests(): Operation {
  return async (dispatch) =>
    CourseAPI.enrolRequests.index().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveEnrolRequestList(
          data.enrolRequests,
          data.permissions,
          data.manageCourseUsersData,
        ),
      );
    });
}

export function approveEnrolRequest(
  enrolRequest: EnrolRequestMiniEntity,
): Operation {
  return async (dispatch) =>
    CourseAPI.enrolRequests
      .approve(formatAttributes(enrolRequest), enrolRequest.id)
      .then((response) => {
        const enrolRequestToUpdate = response.data;
        dispatch(actions.updateEnrolRequest(enrolRequestToUpdate));
      });
}

export function rejectEnrolRequest(requestId: number): Operation {
  return async (dispatch) =>
    CourseAPI.enrolRequests.reject(requestId).then((response) => {
      const enrolRequest = response.data;
      dispatch(actions.updateEnrolRequest(enrolRequest));
    });
}
