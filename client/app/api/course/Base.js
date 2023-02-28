import {
  getCourseId as getCourseIdFromUrl,
  getCourseUserId as getCourseUserIdFromUrl,
} from 'lib/helpers/url-helpers';

import BaseAPI from '../Base';

/** Course level Api helpers should be defined here */
export default class BaseCourseAPI extends BaseAPI {
  // eslint-disable-next-line class-methods-use-this
  get courseId() {
    // TODO: Read the id from redux state or server context
    return getCourseIdFromUrl();
  }

  // eslint-disable-next-line class-methods-use-this
  get courseUserId() {
    return getCourseUserIdFromUrl();
  }
}
