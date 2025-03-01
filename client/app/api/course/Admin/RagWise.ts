import { AxiosResponse } from 'axios';
import {
  Course,
  Folder,
  ForumImport,
  ForumImportData,
  Material,
  RagWiseSettings,
  RagWiseSettingsPostData,
} from 'types/course/admin/ragWise';
import { JobSubmitted } from 'types/jobs';

import { APIResponse } from 'api/types';

import BaseAdminAPI from './Base';

export default class RagWiseAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/rag_wise`;
  }

  index(): Promise<AxiosResponse<RagWiseSettings>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: RagWiseSettingsPostData,
  ): Promise<AxiosResponse<RagWiseSettings>> {
    return this.client.patch(this.urlPrefix, data);
  }

  materials(): Promise<AxiosResponse<{ materials: Material[] }>> {
    return this.client.get(`${this.urlPrefix}/materials`);
  }

  folders(): Promise<AxiosResponse<{ folders: Folder[] }>> {
    return this.client.get(`${this.urlPrefix}/folders`);
  }

  courses(): Promise<AxiosResponse<{ courses: Course[] }>> {
    return this.client.get(`${this.urlPrefix}/courses`);
  }

  forums(): Promise<AxiosResponse<{ forums: ForumImport[] }>> {
    return this.client.get(`${this.urlPrefix}/forums`);
  }

  importCourseForums(params: ForumImportData): APIResponse<JobSubmitted> {
    return this.client.put(`${this.urlPrefix}/import_course_forums`, params);
  }

  destroyImportedDiscussions(params: ForumImportData): APIResponse {
    return this.client.put(
      `${this.urlPrefix}/destroy_imported_discussions`,
      params,
    );
  }
}
