import BaseAPI from './Base';
import { APIResponse } from './types';

class AttachmentsAPI extends BaseAPI {
  #urlPrefix = '/attachments';

  create(file: File): APIResponse<{ success: boolean; id?: number }> {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('name', file.name);

    return this.client.post(this.#urlPrefix, formData);
  }

  delete(attachmentId: number): APIResponse<unknown> {
    return this.client.delete(`${this.#urlPrefix}/${attachmentId}`);
  }
}

const attachmentsAPI = new AttachmentsAPI();

export default attachmentsAPI;
