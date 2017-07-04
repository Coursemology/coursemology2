/* eslint-disable react/no-danger */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import { yellow100 } from 'material-ui/styles/colors';
import { QuestionProp } from '../propTypes';
import { questionTypes } from '../constants';
import Answers from './Answers';
import translations from '../translations';

class SubmissionAnswer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
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

  renderMissingAnswerPanel() {
    const { intl } = this.props;
    return (
      <Card style={{ backgroundColor: yellow100 }}>
        <CardText>
          <span>{intl.formatMessage(translations.missingAnswer)}</span>
        </CardText>
      </Card>
    );
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
        { answerId ? renderer(question, readOnly, answerId, canGrade) : this.renderMissingAnswerPanel() }
      </div>
    );
  }
}

export default injectIntl(SubmissionAnswer);
