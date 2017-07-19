import BaseCourseAPI from '../Base';

export default class BaseAdminAPI extends BaseCourseAPI {
  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/admin`;
  }
}
