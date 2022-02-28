import React from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from '@material-ui/core';
import ProgressGraph from './Charts/ProgressGraph';
import HeatMap from './Charts/HeatMap';
import styles from './Statistics.scss';

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

const Statistics = (props) => {
  const [tabValue, setTabValue] = React.useState(1);

  const tabContent = () => (
    <>
      <div style={{ ...(tabValue === 1 ? {} : { display: 'none' }) }}>
        <HeatMap watchFrequency={props.watchFrequency} />
      </div>
      <div style={{ ...(tabValue === 2 ? {} : { display: 'none' }) }}>
        <ProgressGraph sessions={props.sessions} />
      </div>
    </>
  );
  return (
    <>
      <Tabs
        className={styles.statisticsGraphView}
        onChange={(event, value) => {
          setTabValue(value);
        }}
        style={{ paddingBottom: 0 }}
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
