import {
  getVideoId as getVideoIdFromUrl,
  getVideoSubmissionId as getVideoSubmissionIdfromUrl,
} from 'lib/helpers/url-helpers';

import BaseCourseAPI from '../Base';

/** Video level Api helpers should be defined here */
export default class BaseVideoAPI extends BaseCourseAPI {
  // eslint-disable-next-line class-methods-use-this
  getVideoId() {
    // TODO: Read the id from redux state or server context
    return getVideoIdFromUrl();
  }

  // eslint-disable-next-line class-methods-use-this
  getVideoSubmissionId() {
    return getVideoSubmissionIdfromUrl();
  }
}
