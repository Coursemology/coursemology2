import { AxiosResponse } from 'axios';
import type {
  CommentsSettingsData,
  CommentsSettingsPostData,
} from 'types/course/admin/comments';

import BaseAdminAPI from './Base';

export default class CommentsAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/comments`;
  }

  index(): Promise<AxiosResponse<CommentsSettingsData>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: CommentsSettingsPostData,
  ): Promise<AxiosResponse<CommentsSettingsData>> {
    return this.client.patch(this.urlPrefix, data);
  }
}
