/* eslint class-methods-use-this: "off" */
import BaseCourseAPI from '../Base';

/** Survey level Api helpers should be defined here */
export default class BaseSurveyAPI extends BaseCourseAPI {
  getSurveyId() {
    // TODO: Read the id from redux state or server context
    const match = window.location.pathname.match(/^\/courses\/\d+\/surveys\/(\d+)/);
    return match && match[1];
  }
}
