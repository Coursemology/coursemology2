import {
  getCourseId,
  getAssessmentId,
  getSubmissionId,
} from 'lib/helpers/url-helpers';
import BaseAssessmentAPI from '../../Base';

export default class ForumPostResponseAPI extends BaseAssessmentAPI {
  fetchPosts() {
    return this.getClient().get(
      `/courses/${this.getCourseId()}/forums/all_posts`,
    );
  }

  fetchSelectedPostPacks(answerId) {
    return this.getClient()
      .get(`/courses/${getCourseId()}/assessments/${getAssessmentId()}\
                /submissions/${getSubmissionId()}/answers/${answerId}/forum_post_response/selected_post_packs`);
  }
}
