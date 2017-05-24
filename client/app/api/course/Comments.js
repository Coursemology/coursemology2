import BaseCourseAPI from './Base';

export default class CommentsAPI extends BaseCourseAPI {

  update(topicId, postId, params) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${topicId}/posts/${postId}`, params);
  }

  delete(topicId, postId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${topicId}/posts/${postId}`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/comments`;
  }
}
