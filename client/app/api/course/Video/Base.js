/* eslint class-methods-use-this: "off" */
import { getVideoId as getVideoIdFromUrl } from 'lib/helpers/url-helpers';
import BaseCourseAPI from '../Base';

/** Video level Api helpers should be defined here */
export default class BaseVideoAPI extends BaseCourseAPI {
  getVideoId() {
    // TODO: Read the id from redux state or server context
    return getVideoIdFromUrl();
  }
}
