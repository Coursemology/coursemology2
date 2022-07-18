import { AxiosResponse } from 'axios';
import { ForumPostData } from 'types/course/disbursement';
import { ForumSearchParams } from 'types/course/forum';
import BaseCourseAPI from './Base';

export default class ForumAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/forums`;
  }

  /**
   * Fetches forum post data with search params.
   */
  search(params: ForumSearchParams): Promise<
    AxiosResponse<{
      id: number;
      name: string;
      userPosts: ForumPostData[];
    }>
  > {
    return this.getClient().get(`${this._getUrlPrefix()}/search`, params);
  }
}
