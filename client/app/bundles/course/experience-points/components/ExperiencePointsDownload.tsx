import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Download } from '@mui/icons-material';
import { Grid, IconButton, Tooltip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

interface ExperiencePointsDownloadProps {
  disabled: boolean;
  onClick: () => void;
}

const translations = defineMessages({
  downloadCsvButton: {
    id: 'course.experiencePoints.downloadCsvButton',
    defaultMessage: 'Download CSV',
  },
  downloadRequestSuccess: {
    id: 'course.experiencePoints.downloadRequestSuccess',
    defaultMessage: 'Your request to download is successful',
  },
  downloadFailure: {
    id: 'course.experiencePoints.downloadFailure',
    defaultMessage: 'An error occurred while doing your request for download.',
  },
  downloadPending: {
    id: 'course.experiencePoints.downloadPending',
    defaultMessage:
      'Please wait as your request to download is being processed.',
  },
});

const ExperiencePointsDownload: FC<ExperiencePointsDownloadProps> = (props) => {
  const { disabled, onClick } = props;
  const { t } = useTranslation();

  return (
    <Grid className="justify-end items-center" container>
      <Tooltip title={t(translations.downloadCsvButton)}>
        <IconButton disabled={disabled} onClick={onClick} size="small">
          <Download />
        </IconButton>
      </Tooltip>
    </Grid>
  );
};

export default ExperiencePointsDownload;
