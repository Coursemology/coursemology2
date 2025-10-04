import {
  getAssessmentId,
  getQuestionId,
  getSubmissionId,
} from 'lib/helpers/url-helpers';

import BaseCourseAPI from '../Base';

/** Submission level Api helpers should be defined here */
export default class BaseAssessmentAPI extends BaseCourseAPI {
  // eslint-disable-next-line class-methods-use-this
  get assessmentId() {
    // TODO: Read the id from redux state or server context
    return getAssessmentId();
  }

  // eslint-disable-next-line class-methods-use-this
  get submissionId() {
    return getSubmissionId();
  }

  // eslint-disable-next-line class-methods-use-this
  get questionId() {
    return getQuestionId();
  }
}
