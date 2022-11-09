import { AxiosError } from 'axios';
import {
  CodaveriSettingsData,
  CodaveriSettingsPostData,
} from 'types/course/admin/codaveri';

import CourseAPI from 'api/course';

type Data = Promise<CodaveriSettingsData>;

export const fetchCodaveriSettings = async (): Data => {
  const response = await CourseAPI.admin.codaveri.index();
  return response.data;
};

export const updateCodaveriSettings = async (
  data: CodaveriSettingsData,
): Data => {
  const adaptedData: CodaveriSettingsPostData = {
    settings_codaveri_component: {
      is_only_itsp: data.isOnlyITSP,
    },
  };

  try {
    const response = await CourseAPI.admin.codaveri.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
