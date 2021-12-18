/* eslint class-methods-use-this: "off" */
import {
  getCourseId as getCourseIdFromUrl,
  getCourseUserId as getCourseUserIdFromUrl,
} from 'lib/helpers/url-helpers';
import BaseAPI from '../Base';

/** Course level Api helpers should be defined here */
export default class BaseCourseAPI extends BaseAPI {
  getCourseId() {
    // TODO: Read the id from redux state or server context
    return getCourseIdFromUrl();
  }

  getCourseUserId() {
    return getCourseUserIdFromUrl();
  }
}
