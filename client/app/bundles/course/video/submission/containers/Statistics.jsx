import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Tab, Tabs, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import useTranslation from 'lib/hooks/useTranslation';

import HeatMap from './Charts/HeatMap';
import ProgressGraph from './Charts/ProgressGraph';

const translations = defineMessages({
  frequencyGraph: {
    id: 'course.video.submission.Statistics.frequencyGraph',
    defaultMessage: 'Frequency Graph',
  },
  progressGraph: {
    id: 'course.video.submission.Statistics.progressGraph',
    defaultMessage: 'Progress Graph',
  },
  noWatchSessions: {
    id: 'course.video.submission.Statistics.noWatchSessions',
    defaultMessage:
      'There are no watch sessions for this video submission yet.',
  },
});

const propTypes = {
  sessions: PropTypes.objectOf(
    PropTypes.shape({
      sessionStart: PropTypes.string,
      sessionEnd: PropTypes.string,
      lastVideoTime: PropTypes.number,
      events: PropTypes.arrayOf(
        PropTypes.shape({
          sequenceNum: PropTypes.number,
          eventType: PropTypes.string,
          eventTime: PropTypes.string,
          videoTime: PropTypes.number,
        }),
      ),
    }),
  ).isRequired,
  watchFrequency: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const Statistics = ({ watchFrequency, sessions }) => {
  const { t } = useTranslation();

  const [tabValue, setTabValue] = useState(1);

  const tabContent = () => (
    <>
      <div className={tabValue === 1 ? '' : 'hidden'}>
        <HeatMap watchFrequency={watchFrequency} />
      </div>

      <div className={tabValue === 2 ? '' : 'hidden'}>
        {sessions ? (
          <ProgressGraph sessions={sessions} />
        ) : (
          <Typography className="mt-8" color="text.secondary" variant="body2">
            {t(translations.noWatchSessions)}
          </Typography>
        )}
      </div>
    </>
  );

  return (
    <>
      <Tabs
        indicatorColor="primary"
        onChange={(_, value) => {
          setTabValue(value);
        }}
        textColor="inherit"
        value={tabValue}
        variant="fullWidth"
      >
        <Tab label={t(translations.frequencyGraph)} value={1} />
        <Tab label={t(translations.progressGraph)} value={2} />
      </Tabs>

      {tabContent()}
    </>
  );
};

Statistics.propTypes = propTypes;

export default Statistics;
