import { JobStatusResponse } from 'types/jobs';

import BaseAPI from './Base';
import { APIResponse } from './types';

export default class JobsAPI extends BaseAPI {
  /**
   * Fetches the status of a job
   */
  get(jobUrl: string): APIResponse<JobStatusResponse> {
    return this.client.get(jobUrl);
  }
}
