// The submissions page's plain request actions: reminding students, and unsubmitting or deleting one submission.
import { ReactNode } from 'react';
import { Operation } from 'store';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { CourseUserType } from 'lib/components/core/CourseUserTypeTabs';

import actionTypes from '../constants';
import translations from '../translations';

import { fetchSubmissions } from './jobs';

export const sendAssessmentReminderEmail =
  (assessmentId: number, courseUsers: CourseUserType): Operation =>
  (dispatch) => {
    dispatch({ type: actionTypes.SEND_ASSESSMENT_REMINDER_REQUEST });
    return CourseAPI.assessment.assessments
      .remind(assessmentId, courseUsers)
      .then(() => {
        dispatch({ type: actionTypes.SEND_ASSESSMENT_REMINDER_SUCCESS });
        dispatch(setNotification(translations.sendReminderEmailSuccess));
      })
      .catch(() => {
        dispatch({ type: actionTypes.SEND_ASSESSMENT_REMINDER_FAILURE });
        dispatch(setNotification(translations.requestFailure));
      });
  };

// `successMessage` is rendered as is -- SubmissionsTableRow passes a <FormattedMessage /> naming the student.
export const unsubmitSubmission =
  (submissionId: number, successMessage: ReactNode): Operation =>
  (dispatch) => {
    dispatch({ type: actionTypes.UNSUBMIT_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions
      .unsubmitSubmission(submissionId)
      .then(() => {
        dispatch({ type: actionTypes.UNSUBMIT_SUBMISSION_SUCCESS });
        fetchSubmissions()(dispatch);
        dispatch(setNotification(successMessage));
      })
      .catch(() => {
        dispatch({ type: actionTypes.UNSUBMIT_SUBMISSION_FAILURE });
        dispatch(setNotification(translations.requestFailure));
      });
  };

export const deleteSubmission =
  (submissionId: number, successMessage: ReactNode): Operation =>
  (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions
      .deleteSubmission(submissionId)
      .then(() => {
        dispatch({ type: actionTypes.DELETE_SUBMISSION_SUCCESS });
        dispatch(setNotification(successMessage));
        fetchSubmissions()(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.DELETE_SUBMISSION_FAILURE });
        dispatch(setNotification(translations.requestFailure));
      });
  };
