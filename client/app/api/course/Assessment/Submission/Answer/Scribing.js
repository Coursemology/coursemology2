import BaseAssessmentAPI from '../../Base';

export default class ScribingsAPI extends BaseAssessmentAPI {
  /**
   * Updates a Scribble
   */
  update(answerId, data) {
    return this.client.post(
      `${this.#urlPrefix}/${answerId}/scribing/scribbles`,
      data,
    );
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/${this.submissionId}/answers`;
  }
}
