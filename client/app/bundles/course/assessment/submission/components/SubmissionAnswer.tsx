import { defineMessages } from 'react-intl';
import {
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import {
  HistoryQuestion,
  QuestionFlags,
  SubmissionQuestionData,
} from '../questionGrade';

import Answer from './Answer';

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
    defaultMessage: 'Past Answers',
  },
});

interface Props {
  handleToggleViewHistoryMode: (
    viewHistory: boolean,
    submissionQuestionId: number,
    questionId: number,
  ) => void;
  historyQuestions: Record<string, HistoryQuestion>;
  questionsFlags: Record<string, QuestionFlags>;
  readOnly?: boolean;
  graderView: boolean;
  showMcqMrqSolution: boolean;
  question: SubmissionQuestionData;
  answerId: number;
}

const SubmissionAnswer = (props: Props): JSX.Element => {
  const {
    handleToggleViewHistoryMode,
    historyQuestions,
    questionsFlags,
    readOnly = false,
    graderView,
    showMcqMrqSolution,
    question,
    answerId,
  } = props;

  const { t } = useTranslation();

  const historyQuestion = historyQuestions[question.id];
  const noPastAnswers = historyQuestion
    ? historyQuestion.answerIds.length === 0
    : true;
  const isLoading = historyQuestion ? historyQuestion.isLoading : false;
  const isAutograding = questionsFlags[question.id]
    ? questionsFlags[question.id].isAutograding
    : false;
  const disabled = noPastAnswers || isLoading || isAutograding;

  const HistoryToggle = (): JSX.Element | null => {
    return question.canViewHistory ? (
      <div className="inline-block float-right">
        {isLoading ? (
          <CircularProgress className="inline-block align-middle" size={30} />
        ) : null}
        <Tooltip title={noPastAnswers ? t(translations.noPastAnswers) : ''}>
          <FormControlLabel
            className="float-right"
            control={
              <Switch
                checked={question.viewHistory || false}
                className="toggle-history"
                color="primary"
                onChange={(): void =>
                  handleToggleViewHistoryMode(
                    !question.viewHistory,
                    question.submissionQuestionId,
                    question.id,
                  )
                }
              />
            }
            disabled={disabled}
            label={<b>{t(translations.viewPastAnswers)}</b>}
            labelPlacement="start"
          />
        </Tooltip>
      </div>
    ) : null;
  };

  const MissingAnswer = (): JSX.Element => {
    return <Alert severity="warning">{t(translations.missingAnswer)}</Alert>;
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Typography variant="h6">{question.displayTitle}</Typography>
        <HistoryToggle />
      </div>

      <Typography
        dangerouslySetInnerHTML={{ __html: question.description }}
        variant="body2"
      />
      {readOnly && <Divider />}
      {answerId ? (
        <Answer
          answerId={answerId}
          graderView={graderView}
          question={question}
          readOnly={readOnly}
          showMcqMrqSolution={showMcqMrqSolution}
        />
      ) : (
        <MissingAnswer />
      )}
    </>
  );
};

export default SubmissionAnswer;
