import BaseAPI from './Base';

class AttachmentsAPI extends BaseAPI {

  delete(attachmentId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${attachmentId}`);
  }

  _getUrlPrefix() {
    return '/attachments';
  }
}

const attachmentsAPI = new AttachmentsAPI();

export default attachmentsAPI;
