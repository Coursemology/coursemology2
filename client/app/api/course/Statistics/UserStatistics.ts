import { LearningRateRecordsData } from 'types/course/courseUsers';

import { APIResponse } from 'api/types';

import BaseCourseAPI from '../Base';

// Contains individual-level statistics
export default class UserStatisticsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/statistics/user/${this.courseUserId}`;
  }

  /**
   * Fetches the history of learning rate records for a given user.
   */
  fetchLearningRateRecords(): APIResponse<LearningRateRecordsData> {
    return this.client.get(`${this.#urlPrefix}/learning_rate_records`);
  }
}
