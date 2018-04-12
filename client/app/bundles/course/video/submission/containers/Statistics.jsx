import React from 'react';
import PropTypes from 'prop-types';
import { Tab, Tabs } from 'material-ui/Tabs';
import { injectIntl, intlShape } from 'react-intl';
import ProgressGraph from './Charts/ProgressGraph';

const propTypes = {
  intl: intlShape.isRequired,

  sessions: PropTypes.objectOf(PropTypes.shape({
    sessionStart: PropTypes.string,
    sessionEnd: PropTypes.string,
    lastVideoTime: PropTypes.number,
    events: PropTypes.arrayOf(PropTypes.shape({
      sequenceNum: PropTypes.number,
      eventType: PropTypes.string,
      eventTime: PropTypes.string,
      videoTime: PropTypes.number,
    })),
  })).isRequired,
};

class Statistics extends React.Component {
  render() {
    return (
      <Tabs>
        <Tab label="Progress Graph">
          <ProgressGraph sessions={this.props.sessions} />
        </Tab>
      </Tabs>
    );
  }
}

Statistics.propTypes = propTypes;

export default injectIntl(Statistics);
