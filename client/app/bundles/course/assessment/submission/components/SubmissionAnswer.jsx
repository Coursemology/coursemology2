import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import CircularProgress from 'material-ui/CircularProgress';
import Toggle from 'material-ui/Toggle';
import { yellow100 } from 'material-ui/styles/colors';
import { questionShape, historyQuestionShape, questionFlagsShape } from '../propTypes';
import { questionTypes } from '../constants';
import Answers from './Answers';
import AnswersHistory from './AnswersHistory';

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
  noPastAnswers: {
    id: 'course.assessment.submission.noPastAnswers',
    defaultMessage: 'No past answers.',
  },
  viewPastAnswers: {
    id: 'course.assessment.submission.viewPastAnswers',
    defaultMessage: 'View Past Answers',
  },
});

const styles = {
  containerStyle: {
    width: 210,
    display: 'inline-block',
    float: 'right',
    marginTop: 20,
    marginBottom: 0,
  },
  progressStyle: {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: 10,
  },
  toggleStyle: {
    width: 170,
    display: 'inline-block',
    float: 'right',
  },
};

class SubmissionAnswer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleToggleViewHistoryMode: PropTypes.func.isRequired,
    historyQuestions: PropTypes.objectOf(historyQuestionShape),
    questionsFlags: PropTypes.objectOf(questionFlagsShape),
    readOnly: PropTypes.bool,
    question: questionShape,
    answerId: PropTypes.number,
    graderView: PropTypes.bool,
  };

  static defaultProps = {
    readOnly: false,
  };

  getRenderer(question) {
    const {
      MultipleChoice, MultipleResponse, TextResponse, Comprehension, FileUpload,
      Programming, VoiceResponse, Scribing,
    } = questionTypes;
    const { viewHistory } = question;

    if (viewHistory) {
      return this.getHistoryRenderer(question);
    }

    switch (question.type) {
      case MultipleChoice:
        return Answers.renderMultipleChoice;
      case MultipleResponse:
        return Answers.renderMultipleResponse;
      case TextResponse:
      case Comprehension:
        return Answers.renderTextResponse;
      case FileUpload:
        return Answers.renderFileUpload;
      case Programming:
        return Answers.renderProgramming;
      case Scribing:
        return Answers.renderScribing;
      case VoiceResponse:
        return Answers.renderVoiceResponse;
      default:
        return this.renderMissingRenderer.bind(this);
    }
  }

  getHistoryRenderer(question) {
    const { Programming } = questionTypes;
    switch (question.type) {
      case Programming:
        return AnswersHistory.renderProgramming;
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

  renderHistoryToggle(question) {
    const { handleToggleViewHistoryMode, historyQuestions, questionsFlags, intl } = this.props;
    const { id, viewHistory, canViewHistory, submissionQuestionId } = question;
    const historyQuestion = historyQuestions[id];
    const noPastAnswers = historyQuestion ? historyQuestion.answerIds.length === 0 : false;
    const answersLoaded = historyQuestion ? historyQuestion.pastAnswersLoaded : false;
    const isLoading = historyQuestion ? historyQuestion.isLoading : false;
    const isAutograding = questionsFlags[id] ? questionsFlags[id].isAutograding : false;
    const disabled = noPastAnswers || isLoading || isAutograding;

    if (canViewHistory) {
      return (
        <div style={styles.containerStyle}>
          {isLoading ? <CircularProgress size={30} style={styles.progressStyle} /> : null}
          <Toggle
            label={intl.formatMessage(translations.viewPastAnswers)}
            style={styles.toggleStyle}
            toggled={viewHistory}
            disabled={disabled}
            onToggle={() => handleToggleViewHistoryMode(!viewHistory, submissionQuestionId, id, answersLoaded)}
          />
          {noPastAnswers
            ? <div style={{ float: 'right' }}><FormattedMessage {...translations.noPastAnswers} /></div>
            : null
          }
        </div>
      );
    }
    return null;
  }

  render() {
    const { readOnly, question, answerId, graderView } = this.props;

    const renderer = this.getRenderer(question);

    return (
      <React.Fragment>
        <h3 style={{ display: 'inline-block' }}>
          {question.displayTitle}
        </h3>
        {this.renderHistoryToggle(question)}
        <div dangerouslySetInnerHTML={{ __html: question.description }} />
        <hr />
        { answerId ? renderer(question, readOnly, answerId, graderView) : this.renderMissingAnswerPanel() }
      </React.Fragment>
    );
  }
}

export default injectIntl(SubmissionAnswer);
