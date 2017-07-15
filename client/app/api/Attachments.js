import BaseAPI from './Base';

class AttachmentsAPI extends BaseAPI {

  delete(attachmentId) {
    return this.getClient().delete(`${AttachmentsAPI._getUrlPrefix()}/${attachmentId}`);
  }

  static _getUrlPrefix() {
    return '/attachments';
  }
}

const attachmentsAPI = new AttachmentsAPI();

export default attachmentsAPI;
