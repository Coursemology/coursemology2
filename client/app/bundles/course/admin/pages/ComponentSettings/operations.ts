import { AxiosError } from 'axios';
import {
  CourseComponent,
  CourseComponents,
  CourseComponentsPostData,
} from 'types/course/admin/components';

import CourseAPI from 'api/course';

type Data = Promise<CourseComponents>;

export const fetchComponentSettings = async (): Data => {
  const response = await CourseAPI.admin.components.index();
  return response.data;
};

export const updateComponentSettings = async (data: CourseComponents): Data => {
  const adaptedData: CourseComponentsPostData = {
    settings_components: {
      enabled_component_ids: data.reduce(
        (enabledComponentIds, component) => {
          if (component.enabled) {
            enabledComponentIds.push(component.id);
          }

          return enabledComponentIds;
        },
        <CourseComponent['id'][]>[],
      ),
    },
  };

  try {
    const response = await CourseAPI.admin.components.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
