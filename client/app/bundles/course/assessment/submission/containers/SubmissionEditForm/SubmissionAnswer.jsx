/* eslint-disable react/no-danger */

import React, { PropTypes } from 'react';
import { Field } from 'redux-form';
import { questionTypes } from '../../constants';
import Answers from '../../components/Answers';

class SubmissionAnswer extends React.Component {
  static propTypes = {
    canGrade: PropTypes.bool.isRequired,
    member: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    fields: PropTypes.shape({
      get: PropTypes.func.isRequired,
    }).isRequired,
  };

  static getRenderer(answer) {
    const { MultipleChoice, MultipleResponse, TextResponse, FileUpload, Programming } = questionTypes;
    switch (answer.type) {
      case MultipleChoice:
        return Answers.renderMultipleChoice;
      case MultipleResponse:
        return Answers.renderMultipleResponse;
      case TextResponse:
        return Answers.renderTextResponse;
      case FileUpload:
        return Answers.renderFileUpload;
      case Programming:
        return Answers.renderProgramming;
      default:
        return null;
    }
  }

  render() {
    const { canGrade, member, index, fields } = this.props;
    const answer = fields.get(index);

    const renderer = SubmissionAnswer.getRenderer(answer);
    if (!renderer) { return <div />; }

    return (
      <div>
        <h3>{answer.question.display_title}</h3>
        <div dangerouslySetInnerHTML={{ __html: answer.question.description }} />
        <hr />
        <Field name={`${member}[id]`} component="hidden" />
        { renderer(answer, member, canGrade) }
      </div>
    );
  }
}

export default SubmissionAnswer;
