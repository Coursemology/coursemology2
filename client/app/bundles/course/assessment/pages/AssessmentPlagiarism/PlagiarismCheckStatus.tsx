import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { CheckCircle, Error, PlayArrow, Schedule } from '@mui/icons-material';
import { Button, CircularProgress, Typography } from '@mui/material';
import { AssessmentPlagiarismStatus } from 'types/course/plagiarism';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import formTranslations from 'lib/translations/form';

interface Props {
  isSubmitting: boolean;
  status: AssessmentPlagiarismStatus;
  startPlagiarismCheck: () => void;
}

const translations = defineMessages({
  status: {
    id: 'course.assessment.plagiarism.status',
    defaultMessage: 'Plagiarism Check Status',
  },
  lastRunTime: {
    id: 'course.assessment.plagiarism.lastRunTime',
    defaultMessage: 'Last run at: {date}',
  },
  start: {
    id: 'course.assessment.plagiarism.start',
    defaultMessage: 'New Plagiarism Check',
  },
  notStarted: {
    id: 'course.assessment.plagiarism.notStarted',
    defaultMessage: 'No plagiarism check has been run',
  },
  confirmStartTitle: {
    id: 'course.assessment.plagiarism.confirmStartTitle',
    defaultMessage: 'Confirm Plagiarism Check?',
  },
  confirmStartMessage: {
    id: 'course.assessment.plagiarism.confirmStartMessage',
    defaultMessage:
      'Running a new plagiarism check will remove the previous results.',
  },
});

const getStatusIcon = (
  workflowState: keyof typeof ASSESSMENT_SIMILARITY_WORKFLOW_STATE,
): JSX.Element => {
  switch (workflowState) {
    case ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running:
      return <CircularProgress size={20} />;
    case ASSESSMENT_SIMILARITY_WORKFLOW_STATE.completed:
      return <CheckCircle color="success" />;
    case ASSESSMENT_SIMILARITY_WORKFLOW_STATE.failed:
      return <Error color="error" />;
    case ASSESSMENT_SIMILARITY_WORKFLOW_STATE.not_started:
    default:
      return <Schedule color="disabled" />;
  }
};

const PlagiarismCheckStatus: FC<Props> = (props) => {
  const { t } = useTranslation();

  const { isSubmitting, status, startPlagiarismCheck } = props;
  const workflowState = status.workflowState;
  const isRunning =
    workflowState === ASSESSMENT_SIMILARITY_WORKFLOW_STATE.running;
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <Typography variant="h6">{t(translations.status)}</Typography>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(workflowState)}
          <Typography color="text.secondary" variant="body2">
            {workflowState === ASSESSMENT_SIMILARITY_WORKFLOW_STATE.not_started
              ? t(translations.notStarted)
              : t(translations.lastRunTime, {
                  date: formatLongDateTime(status.lastRunAt),
                })}
          </Typography>
        </div>
        <div className="self-start">
          <Button
            color="primary"
            disabled={isRunning || isSubmitting}
            onClick={() => setOpenDialog(true)}
            size="large"
            startIcon={
              isSubmitting ? <CircularProgress size={20} /> : <PlayArrow />
            }
            variant="contained"
          >
            {t(translations.start)}
          </Button>
        </div>
      </div>

      <Prompt
        disabled={isSubmitting}
        onClickPrimary={() => {
          startPlagiarismCheck();
          setOpenDialog(false);
        }}
        onClose={() => setOpenDialog(false)}
        open={openDialog}
        primaryColor="info"
        primaryLabel={t(formTranslations.continue)}
        title={t(translations.confirmStartTitle)}
      >
        <PromptText>{t(translations.confirmStartMessage)}</PromptText>
      </Prompt>
    </>
  );
};

export default PlagiarismCheckStatus;
