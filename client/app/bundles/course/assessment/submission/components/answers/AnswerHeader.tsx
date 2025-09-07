import { FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { Chip, Tooltip, Typography } from '@mui/material';

import LiveFeedbackHistoryContent from 'course/assessment/pages/AssessmentStatistics/LiveFeedbackHistory';
import statisticsTranslations from 'course/assessment/pages/AssessmentStatistics/translations';
import Prompt from 'lib/components/core/dialogs/Prompt';
import SavingIndicator from 'lib/components/core/indicators/SavingIndicator';
import { SAVING_STATUS } from 'lib/constants/sharedConstants';
import { getAssessmentId } from 'lib/helpers/url-helpers';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { getFlagForAnswerId } from '../../selectors/answerFlags';
import { getSubmissionQuestionHistory } from '../../selectors/history';
import { getSubmission } from '../../selectors/submissions';
import submissionTranslations from '../../translations';

interface AnswerHistoryChipProps {
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
  viewGetHelpHistory: {
    id: 'course.assessment.submission.answers.AnswerHeader.viewGetHelpHistory',
    defaultMessage: 'Get Help History ({count})',
  },
});

const AnswerHeaderChip: FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
}> = (props) => {
  return (
    <Chip
      className={`${props.disabled ? '' : 'hover:bg-gray-300 cursor-pointer'}`}
      clickable={!props.disabled}
      color="info"
      component="button"
      disabled={props.disabled}
      label={props.label}
      onClick={(e) => {
        // prevent calling onSubmit handler when component is within form context
        e.preventDefault();
        props.onClick();
      }}
      size="small"
      variant="outlined"
    />
  );
};

const AnswerHistoryChip: FC<AnswerHistoryChipProps> = (props) => {
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
        <AnswerHeaderChip
          disabled={noPastAnswers}
          label={label}
          onClick={() => openAnswerHistoryView(questionId, questionNumber)}
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
  const submission = useAppSelector(getSubmission);
  const parsedAssessmentId = parseInt(getAssessmentId() ?? '', 10);
  const [openLiveFeedbackHistory, setOpenLiveFeedbackHistory] = useState(false);

  // If getHelpCounts is not returned for this question, that means it is not enabled,
  // so we skip rendering the button entirely.
  const getHelpEntry = submission.getHelpCounts?.find(
    (item) => item.questionId === questionId,
  );
  const getHelpMessageCount = getHelpEntry?.messageCount ?? 0;

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
      <Typography variant="h6">
        {questionTitle ||
          t(submissionTranslations.questionHeading, { number: questionNumber })}
      </Typography>
      <div className="flex items-center space-x-4">
        <SavingIndicator
          savingSize={answerFlag?.savingSize}
          savingStatus={savingStatus}
        />
        {Boolean(getHelpEntry) && (
          <AnswerHeaderChip
            disabled={getHelpMessageCount === 0}
            label={t(translations.viewGetHelpHistory, {
              count: getHelpMessageCount,
            })}
            onClick={() => setOpenLiveFeedbackHistory(true)}
          />
        )}
        {answerId && (
          <AnswerHistoryChip
            openAnswerHistoryView={openAnswerHistoryView}
            questionId={questionId}
            questionNumber={questionNumber}
          />
        )}

        <Prompt
          cancelLabel={t(formTranslations.close)}
          maxWidth="lg"
          onClose={(): void => setOpenLiveFeedbackHistory(false)}
          open={openLiveFeedbackHistory}
          title={t(statisticsTranslations.liveFeedbackHistoryPromptTitle)}
        >
          <LiveFeedbackHistoryContent
            assessmentId={parsedAssessmentId}
            courseUserId={submission.submitter.id}
            questionId={questionId}
            questionNumber={questionNumber}
          />
        </Prompt>
      </div>
    </div>
  );
};

export default AnswerHeader;
