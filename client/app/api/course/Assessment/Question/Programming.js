import { getCourseId, getAssessmentId } from 'lib/helpers/url-helpers';
import BaseAPI from '../Base';

export default class ProgrammingQuestionAPI extends BaseAPI {

  edit(programmingQuestionId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${programmingQuestionId}/edit`);
  }

  create(formData) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    return this.getClient().post(ProgrammingQuestionAPI._getUrlPrefix(), formData, config);
  }

  update(programmingQuestionId, formData) {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    return this.getClient().patch(
      `${ProgrammingQuestionAPI._getUrlPrefix()}/${programmingQuestionId}`, formData, config
    );
  }

  static _getUrlPrefix() {
    return `/courses/${getCourseId()}/assessments/${getAssessmentId()}/question/programming`;
  }
}
