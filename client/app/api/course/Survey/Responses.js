import BaseSurveyAPI from './Base';

export default class ResponsesAPI extends BaseSurveyAPI {
  fetch(responseId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${responseId}/edit`);
  }

  create() {
    return this.getClient().post(this._getUrlPrefix());
  }

  update(responseId, responseFields) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${responseId}`, responseFields);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/surveys/${this.getSurveyId()}/responses`;
  }
}
