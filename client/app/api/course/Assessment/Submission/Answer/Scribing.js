import { getActivePreview } from '../../previewAttemptContext';

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
    // See Submissions.js#urlPrefix. In preview the path is keyed on the attempt id
    // (the submission base-record id), which the browser path does not expose, so it
    // comes from the singleton instead of `this.submissionId` (null on preview URLs).
    if (getActivePreview() !== null || this.assessmentId === null) {
      return `/courses/${this.courseId}/marketplace/attempt/${getActivePreview()}/answers`;
    }
    return `/courses/${this.courseId}/assessments/${this.assessmentId}/submissions/${this.submissionId}/answers`;
  }
}
