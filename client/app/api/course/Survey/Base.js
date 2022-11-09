import { getSurveyId as getSurveyIdFromUrl } from 'lib/helpers/url-helpers';

import BaseCourseAPI from '../Base';

/** Survey level Api helpers should be defined here */
export default class BaseSurveyAPI extends BaseCourseAPI {
  // eslint-disable-next-line class-methods-use-this
  getSurveyId() {
    // TODO: Read the id from redux state or server context
    return getSurveyIdFromUrl();
  }
}
