import { AxiosError } from 'axios';
import { ConditionAbility, ConditionData } from 'types/course/conditions';

import CourseAPI from 'api/course';

import specify from './specifiers';

type Data = Promise<ConditionData[]>;

export const createCondition = async (
  url: ConditionAbility['url'],
  data: Partial<ConditionData>,
): Data => {
  if (!data.type) throw new Error(`Missing condition type for create: ${url}`);

  const adaptedData = specify(data.type).adaptDataForPost(data);
  try {
    const response = await CourseAPI.conditions.create(url, adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    throw error;
  }
};

export const updateCondition = async (data: Partial<ConditionData>): Data => {
  if (!data.type)
    throw new Error(`Missing condition type for update: ${data.url}`);

  const adaptedData = specify(data.type).adaptDataForPost(data);
  try {
    const response = await CourseAPI.conditions.update(data.url, adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    throw error;
  }
};

export const deleteCondition = async (url: ConditionData['url']): Data => {
  const response = await CourseAPI.conditions.delete(url);
  return response.data;
};
