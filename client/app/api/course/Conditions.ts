import {
  AvailableAchievements,
  AvailableAssessments,
  AvailableScholaisticAssessments,
  AvailableSurveys,
  ConditionAbility,
  ConditionData,
  ConditionPostData,
} from 'types/course/conditions';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class ConditionsAPI extends BaseCourseAPI {
  create(
    url: ConditionAbility['url'],
    data: ConditionPostData,
  ): APIResponse<ConditionData[]> {
    return this.client.post(url, data);
  }

  update(
    url: ConditionData['url'],
    data: ConditionPostData,
  ): APIResponse<ConditionData[]> {
    return this.client.patch(url ?? '', data);
  }

  delete(url: ConditionData['url']): APIResponse<ConditionData[]> {
    return this.client.delete(url ?? '');
  }

  fetchAssessments(
    url: ConditionAbility['url'],
  ): APIResponse<AvailableAssessments> {
    return this.client.get(url);
  }

  fetchAchievements(
    url: ConditionAbility['url'],
  ): APIResponse<AvailableAchievements> {
    return this.client.get(url);
  }

  fetchSurveys(url: ConditionAbility['url']): APIResponse<AvailableSurveys> {
    return this.client.get(url);
  }

  fetchScholaisticAssessments(
    url: ConditionAbility['url'],
  ): APIResponse<AvailableScholaisticAssessments> {
    return this.client.get(url);
  }
}
