import BaseCourseAPI from '../Base';

export default class BaseAdminAPI extends BaseCourseAPI {
  get urlPrefix(): string {
    return `/courses/${this.getCourseId()}/admin`;
  }
}
