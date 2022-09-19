import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import {
  CourseComponent,
  CourseComponents,
  CourseComponentsPostData,
} from 'types/course/admin/components';

type Data = Promise<CourseComponents>;
type ProbableData = Promise<CourseComponents | undefined>;

export const fetchComponentSettings = async (): Data => {
  const response = await CourseAPI.admin.components.index();
  return response.data;
};

export const updateComponentSettings = async (
  data: CourseComponents,
): ProbableData => {
  const adaptedData: CourseComponentsPostData = {
    settings_components: {
      enabled_component_ids: data.reduce((enabledComponentIds, component) => {
        if (component.enabled) {
          enabledComponentIds.push(component.id);
        }

        return enabledComponentIds;
      }, <CourseComponent['id'][]>[]),
    },
  };

  try {
    const response = await CourseAPI.admin.components.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};
