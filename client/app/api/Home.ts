import { HomeLayoutData } from 'types/home';

import BaseAPI from './Base';
import { APIResponse } from './types';

export default class HomeAPI extends BaseAPI {
  // eslint-disable-next-line class-methods-use-this
  get #urlPrefix(): string {
    return '/';
  }

  fetch(): APIResponse<HomeLayoutData> {
    return this.client.get(this.#urlPrefix);
  }
}
