import { AxiosResponse } from 'axios';
import {
  ConditionData,
  ConditionAbility,
  ConditionPostData,
} from 'types/course/conditions';
import BaseCourseAPI from './Base';

type Response = Promise<AxiosResponse<ConditionData[]>>;

export default class ConditionsAPI extends BaseCourseAPI {
  create(url: ConditionAbility['url'], data: ConditionPostData): Response {
    return this.getClient().post(url, data);
  }

  update(url: ConditionData['url'], data: ConditionPostData): Response {
    return this.getClient().patch(url ?? '', data);
  }

  delete(url: ConditionData['url']): Response {
    return this.getClient().delete(url ?? '');
  }
}
