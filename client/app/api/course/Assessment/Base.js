/* eslint-disable class-methods-use-this */
import {
  getAssessmentId as getAssessmentIdFromUrl,
  getSubmissionId as getSubmissionIdFromUrl,
} from 'lib/helpers/url-helpers';

import BaseCourseAPI from '../Base';

/** Submission level Api helpers should be defined here */
export default class BaseAssessmentAPI extends BaseCourseAPI {
  getAssessmentId() {
    // TODO: Read the id from redux state or server context
    return getAssessmentIdFromUrl();
  }

  getSubmissionId() {
    return getSubmissionIdFromUrl();
  }
}
