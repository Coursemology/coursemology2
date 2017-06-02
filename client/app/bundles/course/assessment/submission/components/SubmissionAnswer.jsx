/* eslint-disable react/no-danger */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { QuestionProp } from '../propTypes';
import { questionTypes } from '../constants';
import Answers from './Answers';

class SubmissionAnswer extends Component {
  static propTypes = {
    canGrade: PropTypes.bool.isRequired,
    readOnly: PropTypes.bool,
    question: QuestionProp,
    answerId: PropTypes.number,
  };

  static defaultProps = {
    readOnly: false,
  };

  static getRenderer(question) {
    const { MultipleChoice, MultipleResponse, TextResponse, FileUpload, Programming } = questionTypes;
    switch (question.type) {
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
    const { canGrade, readOnly, question, answerId } = this.props;

    const renderer = SubmissionAnswer.getRenderer(question);
    if (!renderer) { return <div />; }

    return (
      <div>
        <h3>{question.displayTitle}</h3>
        <div dangerouslySetInnerHTML={{ __html: question.description }} />
        <hr />
        { renderer(question, readOnly, answerId, canGrade) }
      </div>
    );
  }
}

export default SubmissionAnswer;
