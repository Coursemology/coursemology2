import PropTypes from 'prop-types';
import { Tab, Tabs } from 'material-ui/Tabs';
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

const Statistics = ({ watchFrequency, sessions }) => (
  <Tabs className={styles.statisticsGraphView}>
    <Tab label="Frequency Graph">
      <br />
      <HeatMap watchFrequency={watchFrequency} />
    </Tab>
    <Tab label="Progress Graph">
      <ProgressGraph sessions={sessions} />
    </Tab>
  </Tabs>
);

Statistics.propTypes = propTypes;

export default Statistics;
