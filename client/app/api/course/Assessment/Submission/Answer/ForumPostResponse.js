import {
  getAssessmentId,
  getCourseId,
  getSubmissionId,
} from 'lib/helpers/url-helpers';

import BaseAssessmentAPI from '../../Base';

export default class ForumPostResponseAPI extends BaseAssessmentAPI {
  fetchPosts() {
    return this.client.get(`/courses/${this.getCourseId()}/forums/all_posts`);
  }

  fetchSelectedPostPacks(answerId) {
    return this.client
      .get(`/courses/${getCourseId()}/assessments/${getAssessmentId()}\
                /submissions/${getSubmissionId()}/answers/${answerId}/forum_post_response/selected_post_packs`);
  }
}
