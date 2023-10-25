import { AxiosError } from 'axios';
import {
  CodaveriSettingsData,
  CodaveriSettingsEntity,
  CodaveriSettingsPatchData,
} from 'types/course/admin/codaveri';

import CourseAPI from 'api/course';

type Data = Promise<CodaveriSettingsEntity>;

const convertSettingsDataToEntity = (
  settings: CodaveriSettingsData,
): CodaveriSettingsEntity => ({
  ...settings,
  isOnlyITSP: settings.isOnlyITSP ? 'itsp' : 'default',
});

const convertEntityDataToPatchData = (
  data: CodaveriSettingsEntity,
): CodaveriSettingsPatchData => ({
  settings_codaveri_component: {
    feedback_workflow: data.feedbackWorkflow,
    is_only_itsp: data.isOnlyITSP === 'itsp',
  },
});

export const fetchCodaveriSettings = async (): Data => {
  try {
    const response = await CourseAPI.admin.codaveri.index();
    return convertSettingsDataToEntity(response.data);
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const updateCodaveriSettings = async (
  data: CodaveriSettingsEntity,
): Data => {
  const adaptedData = convertEntityDataToPatchData(data);
  try {
    const response = await CourseAPI.admin.codaveri.update(adaptedData);
    return convertSettingsDataToEntity(response.data);
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
