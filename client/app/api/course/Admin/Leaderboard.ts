import { AxiosResponse } from 'axios';
import {
  LeaderboardSettingsData,
  LeaderboardSettingsPostData,
} from 'types/course/admin/leaderboard';

import BaseAdminAPI from './Base';

export default class LeaderboardAdminAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/leaderboard`;
  }

  index(): Promise<AxiosResponse<LeaderboardSettingsData>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(
    data: LeaderboardSettingsPostData,
  ): Promise<AxiosResponse<LeaderboardSettingsData>> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }
}
