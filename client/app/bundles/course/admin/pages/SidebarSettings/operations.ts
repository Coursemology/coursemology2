import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import { SidebarItems, SidebarItemsPostData } from 'types/course/admin/sidebar';

export const fetchSidebarItems = async (): Promise<SidebarItems> => {
  const response = await CourseAPI.admin.sidebar.index();
  return response.data;
};

export const updateSidebarItems = async (
  data: SidebarItems,
): Promise<SidebarItems> => {
  const adaptedData: SidebarItemsPostData = {
    settings_sidebar: {
      sidebar_items_attributes: data.map(({ id, weight }) => ({ id, weight })),
    },
  };

  try {
    const response = await CourseAPI.admin.sidebar.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
