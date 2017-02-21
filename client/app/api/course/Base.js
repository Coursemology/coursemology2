/* eslint class-methods-use-this: "off" */
import BaseAPI from '../Base';

/** Course level Api helpers should be defined here */
export default class BaseCourseAPI extends BaseAPI {
  getCourseId() {
    // TODO: Read the id from redux state or server context
    const match = window.location.pathname.match(/^\/courses\/(\d+)/);
    return match && match[1];
  }
}
