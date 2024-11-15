import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button, Typography } from '@mui/material';
import { AxiosError } from 'axios';
import { JobCompleted, JobErrored } from 'types/jobs';

import { downloadScoreSummary } from 'course/statistics/operations';
import { CourseAssessment } from 'course/statistics/types';
import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import loadingToast, { LoadingToast } from 'lib/hooks/toast/loadingToast';
import useTranslation from 'lib/hooks/useTranslation';

interface AssessmentsScoreSummaryDownloadProps {
  assessments: CourseAssessment[];
}

const translations = defineMessages({
  selectedNUsers: {
    id: 'course.statistics.StatisticsIndex.assessments.selectedNUsers',
    defaultMessage:
      'Download Score Summary ({n, plural, =1 {# assessment} other {# assessments}})',
  },
  download: {
    id: 'course.statistics.StatisticsIndex.assessments.downloadCsv',
    defaultMessage: 'Download',
  },
  downloadCsvDialogTitle: {
    id: 'course.statistics.StatisticsIndex.assessments.downloadCsv',
    defaultMessage: 'Download Score Summary for the following Assessments?',
  },
  downloadScoreSummarySuccess: {
    id: 'course.statistics.StatisticsIndex.assessments.downloadScoreSummarySuccess',
    defaultMessage: 'Successfully downloaded score summary',
  },
  downloadScoreSummaryFailure: {
    id: 'course.statistics.StatisticsIndex.assessments.downloadScoreSummaryFailure',
    defaultMessage: 'An error occurred while downloading score summary',
  },
  downloadScoreSummaryPending: {
    id: 'course.statistics.StatisticsIndex.assessments.downloadScoreSummaryPending',
    defaultMessage:
      'Please wait as your request to download is being processed',
  },
});

const AssessmentsScoreSummaryDownload = (
  props: AssessmentsScoreSummaryDownloadProps,
): JSX.Element => {
  const { assessments } = props;
  const { t } = useTranslation();

  const [openDialog, setOpenDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSuccess =
    (loadToast: LoadingToast) =>
    (successData: JobCompleted): void => {
      window.location.href = successData.redirectUrl!;
      loadToast.success(t(translations.downloadScoreSummarySuccess));
      setIsDownloading(false);
      setOpenDialog(false);
    };

  const handleFailure =
    (loadToast: LoadingToast) =>
    (error: JobErrored | AxiosError): void => {
      const message =
        error?.message || t(translations.downloadScoreSummaryFailure);
      loadToast.error(message);
      setIsDownloading(false);
    };

  const handleOnClick = (): void => {
    setIsDownloading(true);
    const loadToast = loadingToast(t(translations.downloadScoreSummaryPending));
    downloadScoreSummary(
      handleSuccess(loadToast),
      handleFailure(loadToast),
      assessments.map((assessment) => assessment.id),
    );
  };

  return (
    <>
      <Button
        key="assessment-statistics-csv-download-button"
        color="primary"
        disabled={isDownloading || assessments.length === 0}
        onClick={() => setOpenDialog(true)}
        variant="outlined"
      >
        <Typography variant="body1">
          {t(translations.selectedNUsers, { n: assessments.length })}
        </Typography>
      </Button>

      <Prompt
        onClickPrimary={handleOnClick}
        onClose={() => setOpenDialog(false)}
        open={openDialog}
        primaryColor="info"
        primaryLabel={t(translations.download)}
        title={t(translations.downloadCsvDialogTitle)}
      >
        <PromptText>
          {assessments.map((assessment) => (
            <li key={assessment.id}>{assessment.title}</li>
          ))}
        </PromptText>
      </Prompt>
    </>
  );
};

export default AssessmentsScoreSummaryDownload;
