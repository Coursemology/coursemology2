import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import {
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { yellow } from '@mui/material/colors';

import {
  questionShape,
  historyQuestionShape,
  questionFlagsShape,
} from '../propTypes';
import { questionTypes } from '../constants';
import Answers from './Answers';
import PastAnswers from '../containers/PastAnswers';

const translations = defineMessages({
  missingAnswer: {
    id: 'course.assessment.submission.missingAnswer',
    defaultMessage:
      'There is no answer submitted for this question - this might be caused by \
                    the addition of this question after the submission is submitted.',
  },
  noPastAnswers: {
    id: 'course.assessment.submission.noPastAnswers',
    defaultMessage: 'No past answers.',
  },
  rendererNotImplemented: {
    id: 'course.assessment.submission.rendererNotImplemented',
    defaultMessage:
      'The display for this question type has not been implemented yet.',
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
    float: 'right',
  },
};

class SubmissionAnswer extends Component {
  getRenderer(question) {
    const {
      MultipleChoice,
      MultipleResponse,
      TextResponse,
      Comprehension,
      FileUpload,
      Programming,
      VoiceResponse,
      Scribing,
      ForumPostResponse,
    } = questionTypes;
    const { viewHistory } = question;

    if (viewHistory) {
      return () => <PastAnswers question={question} />;
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
      case ForumPostResponse:
        return Answers.renderForumPostResponse;
      default:
        return this.renderMissingRenderer.bind(this);
    }
  }

  renderHistoryToggle(question) {
    const {
      handleToggleViewHistoryMode,
      historyQuestions,
      questionsFlags,
      intl,
    } = this.props;
    const { id, viewHistory, canViewHistory, submissionQuestionId } = question;
    const historyQuestion = historyQuestions[id];
    const noPastAnswers = historyQuestion
      ? historyQuestion.answerIds.length === 0
      : true;
    const answersLoaded = historyQuestion
      ? historyQuestion.pastAnswersLoaded
      : false;
    const isLoading = historyQuestion ? historyQuestion.isLoading : false;
    const isAutograding = questionsFlags[id]
      ? questionsFlags[id].isAutograding
      : false;
    const disabled = noPastAnswers || isLoading || isAutograding;

    if (canViewHistory) {
      return (
        <div style={styles.containerStyle}>
          {isLoading ? (
            <CircularProgress size={30} style={styles.progressStyle} />
          ) : null}
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={viewHistory || false}
                  className="toggle-history"
                  color="primary"
                  onChange={() =>
                    handleToggleViewHistoryMode(
                      !viewHistory,
                      submissionQuestionId,
                      id,
                      answersLoaded,
                    )
                  }
                />
              }
              disabled={disabled}
              label={<b>{intl.formatMessage(translations.viewPastAnswers)}</b>}
              labelPlacement="start"
              style={styles.toggleStyle}
            />
          </>
          {noPastAnswers ? (
            <div style={{ float: 'right' }}>
              <FormattedMessage {...translations.noPastAnswers} />
            </div>
          ) : null}
        </div>
      );
    }
    return null;
  }

  renderMissingAnswerPanel() {
    const { intl } = this.props;
    return (
      <Card id="missing-answer" style={{ backgroundColor: yellow[100] }}>
        <CardContent>
          <span>{intl.formatMessage(translations.missingAnswer)}</span>
        </CardContent>
      </Card>
    );
  }

  renderMissingRenderer() {
    const { intl } = this.props;
    return (
      <Card style={{ backgroundColor: yellow[100] }}>
        <CardContent>
          <span>{intl.formatMessage(translations.rendererNotImplemented)}</span>
        </CardContent>
      </Card>
    );
  }

  render() {
    const { readOnly, showMcqMrqSolution, question, answerId, graderView } =
      this.props;
    const renderer = this.getRenderer(question);

    return (
      <>
        <h3 style={{ display: 'inline-block' }}>{question.displayTitle}</h3>
        {this.renderHistoryToggle(question)}
        <div dangerouslySetInnerHTML={{ __html: question.description }} />
        <hr />
        {answerId
          ? renderer({
              question,
              readOnly,
              answerId,
              graderView,
              showMcqMrqSolution,
            })
          : this.renderMissingAnswerPanel()}
      </>
    );
  }
}

SubmissionAnswer.propTypes = {
  intl: PropTypes.object.isRequired,
  handleToggleViewHistoryMode: PropTypes.func.isRequired,
  historyQuestions: PropTypes.objectOf(historyQuestionShape),
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  readOnly: PropTypes.bool,
  graderView: PropTypes.bool,
  showMcqMrqSolution: PropTypes.bool,
  question: questionShape,
  answerId: PropTypes.number,
};

SubmissionAnswer.defaultProps = {
  readOnly: false,
};

export default injectIntl(SubmissionAnswer);
