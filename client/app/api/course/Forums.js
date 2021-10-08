import BaseCourseAPI from './Base';

export default class ForumsAPI extends BaseCourseAPI {
    getAllPosts() {
        return this.getClient().get(this._getUrlPrefix());
    }

    _getUrlPrefix() {
        return `/courses/${this.getCourseId()}/forums/all_posts`;
    }
}
