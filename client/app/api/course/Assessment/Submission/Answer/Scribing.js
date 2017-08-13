/* eslint class-methods-use-this: "off" */
import { getCourseId, getAssessmentId, getSubmissionId } from 'lib/helpers/url-helpers';
import BaseAssessmentAPI from '../../Base';

export default class ScribingsAPI extends BaseAssessmentAPI {
  /**
   * Updates a Scribble
   */
  update(answerId, data) {
    return this.getClient().post(`${this._getUrlPrefix()}/${answerId}/scribing/scribbles`, data);
  }

  _getUrlPrefix() {
    const prefix = `/courses/${getCourseId()}/assessments/${getAssessmentId()}\
/submissions/${getSubmissionId()}/answers`;
    return prefix;
  }
}
