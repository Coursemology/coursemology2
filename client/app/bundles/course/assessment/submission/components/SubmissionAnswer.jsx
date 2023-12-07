import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import { questionTypes } from '../constants';
import PastAnswers from '../containers/PastAnswers';
import { historyQuestionShape, questionShape } from '../propTypes';

import Answers from './Answers';

const translations = defineMessages({
  missingAnswer: {
    id: 'course.assessment.submission.SubmissionAnswer.missingAnswer',
    defaultMessage:
      'There is no answer submitted for this question - this might be caused by \
                    the addition of this question after the submission is submitted.',
  },
  rendererNotImplemented: {
    id: 'course.assessment.submission.SubmissionAnswer.rendererNotImplemented',
    defaultMessage:
      'The display for this question type has not been implemented yet.',
  },
  noPastAnswers: {
    id: 'course.assessment.submission.SubmissionAnswer.noPastAnswers',
    defaultMessage: 'No past answers.',
  },
  viewPastAnswers: {
    id: 'course.assessment.submission.SubmissionAnswer.viewPastAnswers',
    defaultMessage: 'Past answers',
  },
});

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
      // eslint-disable-next-line react/display-name
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
    const { handleToggleViewHistoryMode, historyQuestions, intl } = this.props;
    const { id, viewHistory, canViewHistory, submissionQuestionId } = question;
    const historyQuestion = historyQuestions[id];
    const noPastAnswers = historyQuestion
      ? historyQuestion.answerIds.length === 0
      : true;
    const answersLoaded = historyQuestion
      ? historyQuestion.pastAnswersLoaded
      : false;
    const isLoading = historyQuestion ? historyQuestion.isLoading : false;
    const disabled = noPastAnswers || isLoading;

    if (!canViewHistory) return null;

    return (
      <div className="flex items-center">
        {isLoading && <CircularProgress size={20} />}
        <Tooltip
          title={
            noPastAnswers ? intl.formatMessage(translations.noPastAnswers) : ''
          }
        >
          <FormControlLabel
            className="whitespace-nowrap"
            control={
              <Switch
                checked={viewHistory || false}
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
            label={intl.formatMessage(translations.viewPastAnswers)}
            labelPlacement="start"
          />
        </Tooltip>
      </div>
    );
  }

  renderMissingAnswerPanel() {
    const { intl } = this.props;
    return (
      <Alert severity="warning">
        {intl.formatMessage(translations.missingAnswer)}
      </Alert>
    );
  }

  renderMissingRenderer() {
    const { intl } = this.props;
    return (
      <Card className="color-yellow-100">
        <CardContent>
          {intl.formatMessage(translations.rendererNotImplemented)}
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
        <div className="flex items-start justify-between">
          <Typography variant="h6">{question.displayTitle}</Typography>
          {this.renderHistoryToggle(question)}
        </div>

        <Typography
          dangerouslySetInnerHTML={{ __html: question.description }}
          variant="body2"
        />
        <Divider />
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
