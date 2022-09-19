import BaseCourseAPI from '../Base';

export default class BaseAdminAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/admin`;
  }
}
