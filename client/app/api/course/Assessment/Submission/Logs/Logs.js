import BaseAPI from '../../Base';

export default class LogsAPI extends BaseAPI {
  get #urlPrefix() {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/${this.submissionId}/logs`;
  }

  index() {
    return this.client.get(this.#urlPrefix);
  }
}
