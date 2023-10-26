import { AxiosResponse } from 'axios';
import {
  CodaveriSettingsData,
  CodaveriSettingsPatchData,
  CodaveriSwitchQnsEvaluatorPatchData,
} from 'types/course/admin/codaveri';

import BaseAdminAPI from './Base';

export default class CodaveriAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/codaveri`;
  }

  index(): Promise<AxiosResponse<CodaveriSettingsData>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: CodaveriSettingsPatchData,
  ): Promise<AxiosResponse<CodaveriSettingsData>> {
    return this.client.patch(this.urlPrefix, data);
  }

  updateEvaluatorForAllQuestions(
    data: CodaveriSwitchQnsEvaluatorPatchData,
  ): Promise<AxiosResponse<CodaveriSettingsData>> {
    return this.client.patch(`${this.urlPrefix}/update_evaluator`, data);
  }
}
