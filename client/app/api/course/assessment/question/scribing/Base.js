/* eslint class-methods-use-this: "off" */
import BaseAssessmentAPI from '../../Base';

/** Survey level Api helpers should be defined here */
export default class BaseScribingAPI extends BaseAssessmentAPI {
  getScribingId() {
    const match = window.location.pathname.match(/^\/courses\/\d+\/assessments\/\d+\/question\/scribing\/(\d+)/);
    return match && match[1];
  }
}
