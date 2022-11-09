import { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';

import HeatMap from './Charts/HeatMap';
import ProgressGraph from './Charts/ProgressGraph';

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
  const [tabValue, setTabValue] = useState(1);

  const tabContent = () => (
    <>
      <div className={tabValue === 1 ? '' : 'hidden'}>
        <HeatMap watchFrequency={watchFrequency} />
      </div>
      <div className={tabValue === 2 ? '' : 'hidden'}>
        <ProgressGraph sessions={sessions} />
      </div>
    </>
  );
  return (
    <>
      <Tabs
        indicatorColor="primary"
        onChange={(event, value) => {
          setTabValue(value);
        }}
        textColor="inherit"
        value={tabValue}
        variant="fullWidth"
      >
        <Tab label="Frequency Graph" value={1} />
        <Tab label="Progress Graph" value={2} />
      </Tabs>
      {tabContent()}
    </>
  );
};

Statistics.propTypes = propTypes;

export default Statistics;
