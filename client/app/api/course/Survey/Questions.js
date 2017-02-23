import BaseSurveyAPI from './Base';

export default class QuestionsAPI extends BaseSurveyAPI {
  create(questionFields) {
    return this.getClient().post(this._getUrlPrefix(), questionFields);
  }

  update(questionId, questionFields) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${questionId}`, questionFields);
  }

  delete(questionId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${questionId}`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/surveys/${this.getSurveyId()}/questions`;
  }
}
