import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Chip, Tooltip, Typography } from '@mui/material';

import SavingIndicator from 'lib/components/core/indicators/SavingIndicator';
import { SAVING_STATUS } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getFlagForAnswerId } from '../../selectors/answerFlags';
import { getSubmissionQuestionHistory } from '../../selectors/history';
import { getSubmission } from '../../selectors/submissions';
import submissionTranslations from '../../translations';

interface HistoryToggleProps {
  questionNumber: number;
  questionId: number;
  openAnswerHistoryView: (questionId: number, questionNumber: number) => void;
}

const translations = defineMessages({
  noPastAnswers: {
    id: 'course.assessment.submission.answers.AnswerHeader.noPastAnswers',
    defaultMessage: 'No past answers.',
  },
  viewPastAnswers: {
    id: 'course.assessment.submission.answers.AnswerHeader.viewPastAnswers',
    defaultMessage: 'Past Answers ({count})',
  },
  viewAllAnswers: {
    id: 'course.assessment.submission.answers.AnswerHeader.viewAllAnswers',
    defaultMessage: 'All Answers ({count})',
  },
});

const HistoryToggle: FC<HistoryToggleProps> = (props) => {
  const { questionNumber, questionId, openAnswerHistoryView } = props;
  const { t } = useTranslation();

  const submission = useAppSelector(getSubmission);
  const attempting = submission.workflowState === 'attempting';
  const { allAnswers, canViewHistory } = useAppSelector(
    getSubmissionQuestionHistory(submission.id, questionId),
  );

  if (!canViewHistory) return null;
  const noPastAnswers =
    allAnswers.length === 0 || (allAnswers.length === 1 && !attempting);
  const label = attempting
    ? t(translations.viewPastAnswers, { count: allAnswers.length })
    : t(translations.viewAllAnswers, { count: allAnswers.length });

  // wrap element so tooltip displays when it's disabled
  return (
    <Tooltip title={noPastAnswers ? t(translations.noPastAnswers) : ''}>
      <span>
        <Chip
          className={`hover:bg-gray-300 ${noPastAnswers ? '' : 'cursor-pointer'}`}
          clickable={noPastAnswers}
          color="info"
          component="button"
          disabled={noPastAnswers}
          label={label}
          onClick={(e) => {
            // prevent calling onSubmit handler when component is within form context
            e.preventDefault();
            openAnswerHistoryView(questionId, questionNumber);
          }}
          size="small"
          variant="outlined"
        />
      </span>
    </Tooltip>
  );
};

interface AnswerHeaderProps {
  questionId: number;
  questionNumber: number;
  questionTitle: string;
  answerId: number | null;
  openAnswerHistoryView: (questionId: number, questionNumber: number) => void;
}

const AnswerHeader: FC<AnswerHeaderProps> = (props) => {
  const {
    answerId,
    questionId,
    questionNumber,
    questionTitle,
    openAnswerHistoryView,
  } = props;
  const answerFlag = useAppSelector((state) =>
    getFlagForAnswerId(state, answerId),
  );
  const {
    formState: { dirtyFields },
  } = useFormContext();
  const { t } = useTranslation();
  const isAnswerDirty = answerId ? !!dirtyFields[answerId] : false;

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
    <div className="flex items-center justify-between sticky top-0 z-10 bg-white border-only-b-neutral-200 -mx-5 px-5">
      <div className="absolute -left-6 flex items-center justify-center rounded-full wh-10 bg-neutral-500">
        <Typography color="white" variant="body2">
          {questionNumber}
        </Typography>
      </div>
      <Typography className="line-clamp-2 xl:line-clamp-1" variant="h6">
        {questionTitle ||
          t(submissionTranslations.questionHeading, { number: questionNumber })}
      </Typography>
      <div className="flex items-center space-x-4">
        <SavingIndicator
          savingSize={answerFlag?.savingSize}
          savingStatus={savingStatus}
        />
        {answerId && (
          <HistoryToggle
            openAnswerHistoryView={openAnswerHistoryView}
            questionId={questionId}
            questionNumber={questionNumber}
          />
        )}
      </div>
    </div>
  );
};

export default AnswerHeader;
