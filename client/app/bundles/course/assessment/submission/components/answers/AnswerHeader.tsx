import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { FormControlLabel, Switch, Tooltip, Typography } from '@mui/material';
import { SubmissionQuestionBaseData } from 'types/course/assessment/submission/question/types';

import SavingIndicator from 'lib/components/core/indicators/SavingIndicator';
import { SAVING_STATUS } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { toggleViewHistoryMode } from '../../actions';
import { QuestionHistory } from '../../reducers/history/types';
import { getFlagForAnswerId } from '../../selectors/answerFlags';

interface HistoryToggleProps {
  historyQuestions: Record<number, QuestionHistory>;
  question: SubmissionQuestionBaseData;
}

const translations = defineMessages({
  noPastAnswers: {
    id: 'course.assessment.submission.answers.AnswerHeader.noPastAnswers',
    defaultMessage: 'No past answers.',
  },
  viewPastAnswers: {
    id: 'course.assessment.submission.answers.AnswerHeader.viewPastAnswers',
    defaultMessage: 'Past Answers',
  },
});

const HistoryToggle: FC<HistoryToggleProps> = (props) => {
  const { historyQuestions, question } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const historyQuestion = historyQuestions[question.id];
  const noPastAnswers = historyQuestion
    ? historyQuestion.answerIds.length === 0
    : true;
  const isLoading = historyQuestion ? historyQuestion.isLoading : false;
  const disabled = noPastAnswers || isLoading;

  if (!question.canViewHistory) return null;

  const handleToggleViewHistoryMode = (): void => {
    dispatch(
      toggleViewHistoryMode(
        !question.viewHistory,
        question.submissionQuestionId,
        question.id,
        historyQuestion.pastAnswersLoaded,
      ),
    );
  };

  return (
    <Tooltip title={noPastAnswers ? t(translations.noPastAnswers) : ''}>
      <FormControlLabel
        className="whitespace-nowrap"
        control={
          <Switch
            checked={question.viewHistory || false}
            color="primary"
            onChange={(): void => handleToggleViewHistoryMode()}
          />
        }
        disabled={disabled}
        label={t(translations.viewPastAnswers)}
        labelPlacement="start"
      />
    </Tooltip>
  );
};

interface AnswerHeaderProps {
  answerId: number;
  historyQuestions: Record<number, QuestionHistory>;
  question: SubmissionQuestionBaseData;
}

const AnswerHeader: FC<AnswerHeaderProps> = (props) => {
  const { answerId, historyQuestions, question } = props;
  const answerFlag = useAppSelector((state) =>
    getFlagForAnswerId(state, answerId),
  );
  const {
    formState: { dirtyFields },
  } = useFormContext();
  const isAnswerDirty = !!dirtyFields[answerId];

  // to mitigate the issue when, during saving, user modify the answer and hence
  // the saving status will be None for a while, then Saved (ongoing Saving is finished),
  // then None again (user keep on modifying answer). We decided to keep it consistent by
  // having saving Status to be None if answer is Dirty, since the Saved indicator is not
  // right here (answer has been modified)
  const savingStatus =
    isAnswerDirty && answerFlag?.savingStatus === SAVING_STATUS.Saved
      ? SAVING_STATUS.None
      : answerFlag?.savingStatus;

  return (
    <div className="flex items-start justify-between">
      <Typography variant="h6">{question.questionNumber}</Typography>

      <div className="flex items-center">
        <SavingIndicator savingStatus={savingStatus} />

        <HistoryToggle
          historyQuestions={historyQuestions}
          question={question}
        />
      </div>
    </div>
  );
};

export default AnswerHeader;
