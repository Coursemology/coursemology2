import {
  AvailableAchievements,
  AvailableAssessments,
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
    return this.getClient().post(url, data);
  }

  update(
    url: ConditionData['url'],
    data: ConditionPostData,
  ): APIResponse<ConditionData[]> {
    return this.getClient().patch(url ?? '', data);
  }

  delete(url: ConditionData['url']): APIResponse<ConditionData[]> {
    return this.getClient().delete(url ?? '');
  }

  fetchAssessments(
    url: ConditionAbility['url'],
  ): APIResponse<AvailableAssessments> {
    return this.getClient().get(url);
  }

  fetchAchievements(
    url: ConditionAbility['url'],
  ): APIResponse<AvailableAchievements> {
    return this.getClient().get(url);
  }

  fetchSurveys(url: ConditionAbility['url']): APIResponse<AvailableSurveys> {
    return this.getClient().get(url);
  }
}
