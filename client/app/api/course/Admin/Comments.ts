import { AxiosResponse } from 'axios';
import type {
  CommentsSettingsData,
  CommentsSettingsPostData,
} from 'types/course/admin/comments';

import BaseAdminAPI from './Base';

export default class CommentsAdminAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/comments`;
  }

  index(): Promise<AxiosResponse<CommentsSettingsData>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(
    data: CommentsSettingsPostData,
  ): Promise<AxiosResponse<CommentsSettingsData>> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }
}
