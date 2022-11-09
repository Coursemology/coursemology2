import {
  getAssessmentId as getAssessmentIdFromUrl,
  getSubmissionId as getSubmissionIdFromUrl,
} from 'lib/helpers/url-helpers';

import BaseCourseAPI from '../Base';

/** Submission level Api helpers should be defined here */
export default class BaseAssessmentAPI extends BaseCourseAPI {
  // eslint-disable-next-line class-methods-use-this
  getAssessmentId() {
    // TODO: Read the id from redux state or server context
    return getAssessmentIdFromUrl();
  }

  // eslint-disable-next-line class-methods-use-this
  getSubmissionId() {
    return getSubmissionIdFromUrl();
  }
}
