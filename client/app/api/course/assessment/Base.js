/* eslint class-methods-use-this: "off" */
import BaseCourseAPI from '../Base';

/** Assessment level Api helpers should be defined here */
export default class BaseAssessmentAPI extends BaseCourseAPI {
  getAssessmentId() {
    const match = window.location.pathname.match(/^\/courses\/\d+\/assessments\/(\d+)/);
    return match && match[1];
  }
}
