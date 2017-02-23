import BaseSurveyAPI from './Base';

export default class SurveysAPI extends BaseSurveyAPI {
  fetch(surveyId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${surveyId}`);
  }

  index() {
    return this.getClient().get(this._getUrlPrefix());
  }

  create(surveyFields) {
    return this.getClient().post(this._getUrlPrefix(), surveyFields);
  }

  update(surveyId, surveyFields) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${surveyId}`, surveyFields);
  }

  delete(surveyId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${surveyId}`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/surveys`;
  }
}
