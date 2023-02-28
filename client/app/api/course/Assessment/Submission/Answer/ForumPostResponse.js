import BaseAssessmentAPI from '../../Base';

export default class ForumPostResponseAPI extends BaseAssessmentAPI {
  fetchPosts() {
    return this.client.get(`/courses/${this.courseId}/forums/all_posts`);
  }

  fetchSelectedPostPacks(answerId) {
    return this.client
      .get(`/courses/${this.courseId}/assessments/${this.assessmentId}\
                /submissions/${this.submissionId}/answers/${answerId}/forum_post_response/selected_post_packs`);
  }
}
