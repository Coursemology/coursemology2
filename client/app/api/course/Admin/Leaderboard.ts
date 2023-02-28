import { AxiosResponse } from 'axios';
import {
  LeaderboardSettingsData,
  LeaderboardSettingsPostData,
} from 'types/course/admin/leaderboard';

import BaseAdminAPI from './Base';

export default class LeaderboardAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/leaderboard`;
  }

  index(): Promise<AxiosResponse<LeaderboardSettingsData>> {
    return this.getClient().get(this.urlPrefix);
  }

  update(
    data: LeaderboardSettingsPostData,
  ): Promise<AxiosResponse<LeaderboardSettingsData>> {
    return this.getClient().patch(this.urlPrefix, data);
  }
}
