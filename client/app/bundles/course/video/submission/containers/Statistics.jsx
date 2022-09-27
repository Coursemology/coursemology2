import { useState } from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@mui/material';
import ProgressGraph from './Charts/ProgressGraph';
import HeatMap from './Charts/HeatMap';

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
        textColor="inherit"
        onChange={(event, value) => {
          setTabValue(value);
        }}
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
