import { AxiosResponse } from 'axios';
import {
  ConditionData,
  ConditionAbility,
  ConditionPostData,
  AvailableAssessments,
  AvailableSurveys,
  AvailableAchievements,
} from 'types/course/conditions';
import BaseCourseAPI from './Base';

type Response<Data> = Promise<AxiosResponse<Data>>;

export default class ConditionsAPI extends BaseCourseAPI {
  create(
    url: ConditionAbility['url'],
    data: ConditionPostData,
  ): Response<ConditionData[]> {
    return this.getClient().post(url, data);
  }

  update(
    url: ConditionData['url'],
    data: ConditionPostData,
  ): Response<ConditionData[]> {
    return this.getClient().patch(url ?? '', data);
  }

  delete(url: ConditionData['url']): Response<ConditionData[]> {
    return this.getClient().delete(url ?? '');
  }

  fetchAssessments(
    url: ConditionAbility['url'],
  ): Response<AvailableAssessments> {
    return this.getClient().get(url);
  }

  fetchAchievements(
    url: ConditionAbility['url'],
  ): Response<AvailableAchievements> {
    return this.getClient().get(url);
  }

  fetchSurveys(url: ConditionAbility['url']): Response<AvailableSurveys> {
    return this.getClient().get(url);
  }
}
