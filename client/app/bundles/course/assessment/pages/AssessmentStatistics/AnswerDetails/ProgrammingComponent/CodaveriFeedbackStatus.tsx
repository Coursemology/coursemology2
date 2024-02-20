import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Paper, Typography } from '@mui/material';
import { CodaveriFeedback } from 'types/course/statistics/answer';

import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  codaveriFeedbackStatus: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.codaveriFeedbackStatus',
    defaultMessage: 'Codaveri Feedback Status',
  },
  loadingFeedbackGeneration: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.loadingFeedbackGeneration',
    defaultMessage: 'Generating Feedback. Please wait...',
  },
  successfulFeedbackGeneration: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.successfulFeedbackGeneration',
    defaultMessage: 'Feedback has been successfully generated.',
  },
  failedFeedbackGeneration: {
    id: 'course.assessment.submission.CodaveriFeedbackStatus.failedFeedbackGeneration',
    defaultMessage: 'Failed to generate feedback. Please try again later.',
  },
});

const codaveriJobDisplay = {
  submitted: {
    feedbackBgColor: 'bg-orange-100',
    feedbackDescription: translations.loadingFeedbackGeneration,
  },
  completed: {
    feedbackBgColor: 'bg-green-100',
    feedbackDescription: translations.successfulFeedbackGeneration,
  },
  errored: {
    feedbackBgColor: 'bg-red-100',
    feedbackDescription: translations.failedFeedbackGeneration,
  },
};

interface Props {
  status?: CodaveriFeedback;
}

const CodaveriFeedbackStatus: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { status } = props;

  if (!status) {
    return null;
  }

  const { feedbackBgColor, feedbackDescription } =
    codaveriJobDisplay[status.jobStatus];

  return (
    <Paper className="mb-8">
      <Typography
        className={`${feedbackBgColor} table-cell p-8 font-bold`}
        variant="body2"
      >
        {t(translations.codaveriFeedbackStatus)}
      </Typography>
      <Typography className="table-cell pl-5" variant="body2">
        {t(feedbackDescription)}
      </Typography>
    </Paper>
  );
};

export default CodaveriFeedbackStatus;
