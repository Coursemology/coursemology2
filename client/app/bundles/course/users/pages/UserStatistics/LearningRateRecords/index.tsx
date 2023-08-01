import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import { fetchCourseUserLearningRateData } from 'bundles/course/users/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import LearningRateRecordsChart from './LearningRateRecordsChart';

const translations = defineMessages({
  header: {
    id: 'course.users.UserStatistics.LearningRateRecords.header',
    defaultMessage: 'Learning Rate',
  },
});

const LearningRateRecords: FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <Typography variant="h6">{t(translations.header)}</Typography>
      <Preload
        render={<LoadingIndicator />}
        while={fetchCourseUserLearningRateData}
      >
        {(data): JSX.Element => (
          <LearningRateRecordsChart
            learningRateRecords={data.learningRateRecords}
          />
        )}
      </Preload>
    </>
  );
};

export default LearningRateRecords;
