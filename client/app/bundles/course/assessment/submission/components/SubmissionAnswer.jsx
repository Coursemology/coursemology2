/* eslint-disable react/no-danger */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import { yellow100 } from 'material-ui/styles/colors';
import { questionShape } from '../propTypes';
import { questionTypes } from '../constants';
import Answers from './Answers';

const translations = defineMessages({
  missingAnswer: {
    id: 'course.assessment.submission.missingAnswer',
    defaultMessage: 'There is no answer submitted for this question - this might be caused by \
                    the addition of this question after the submission is submitted.',
  },
  rendererNotImplemented: {
    id: 'course.assessment.submission.rendererNotImplemented',
    defaultMessage: 'The display for this question type has not been implemented yet.',
  },
});

class SubmissionAnswer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    readOnly: PropTypes.bool,
    question: questionShape,
    answerId: PropTypes.number,
  };

  static defaultProps = {
    readOnly: false,
  };

  getRenderer(question) {
    const { MultipleChoice, MultipleResponse, TextResponse, FileUpload, Programming, Scribing } = questionTypes;
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
      case Scribing:
        return Answers.renderScribing;
      default:
        return this.renderMissingRenderer.bind(this);
    }
  }

  renderMissingRenderer() {
    const { intl } = this.props;
    return (
      <Card style={{ backgroundColor: yellow100 }}>
        <CardText>
          <span>{intl.formatMessage(translations.rendererNotImplemented)}</span>
        </CardText>
      </Card>
    );
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
    const { readOnly, question, answerId } = this.props;

    const renderer = this.getRenderer(question);

    return (
      <div>
        <h3>{question.displayTitle}</h3>
        <div dangerouslySetInnerHTML={{ __html: question.description }} />
        <hr />
        { answerId ? renderer(question, readOnly, answerId) : this.renderMissingAnswerPanel() }
      </div>
    );
  }
}

export default injectIntl(SubmissionAnswer);
