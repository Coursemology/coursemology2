import { Component } from 'react';
import { Scatter } from 'react-chartjs-2';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { videoDefaults } from 'lib/constants/videoConstants';
import { formatTimestamp } from 'lib/helpers/videoHelpers';

import { seekToDirectly } from '../../actions/video';
import translations from '../../translations';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

const graphGlobalOptions = (intl, videoDuration) => ({
  plugins: {
    legend: {
      display: false,
    },
  },
  elements: {
    point: {
      borderWidth: 3,
      hoverBorderWidth: 2,
      hoverRadius: 5,
      radius: 5,
      hitRadius: 10,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: intl.formatMessage(translations.eventRealTimeLabel),
        fontSize: 15,
      },
      suggestedMin: 0,
      ticks: {
        callback: formatTimestamp,
      },
    },
    y: {
      title: {
        display: true,
        text: intl.formatMessage(translations.eventVideoTimeLabel),
        fontSize: 15,
      },
      suggestedMin: 0,
      max: videoDuration,
      ticks: {
        callback: formatTimestamp,
      },
    },
  },
});

const graphDataLineOptions = {
  showLine: true,
  backgroundColor: 'rgba(75,192,192,0.4)',
  borderColor: 'rgba(75,192,192,1)',
  pointBorderColor: 'rgba(75,192,192,1)',
  pointBackgroundColor: '#fff',
};

const propTypes = {
  intl: PropTypes.object.isRequired,

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
  videoDuration: PropTypes.number.isRequired,
  onMarkerClick: PropTypes.func,
};

const defaultProps = {
  onMarkerClick: () => {},
};

class ProgressGraph extends Component {
  constructor(props) {
    super(props);
    this.displayDataCache = {};

    this.state = { selectedSessionId: Object.keys(props.sessions)[0] };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.displayDataCache = {};
    if (!nextProps[this.state.selectedSessionId]) {
      this.setState({ selectedSessionId: Object.keys(nextProps.sessions)[0] });
    }
  }

  computeData(id) {
    if (this.displayDataCache[id]) {
      return this.displayDataCache[id];
    }

    const session = this.props.sessions[id];
    if (!session) {
      return null;
    }
    const startTime = new Date(session.sessionStart);
    const endTime = new Date(session.sessionEnd);
    const videoEnd = session.lastVideoTime;
    this.displayDataCache[id] = this.processEvents(
      session.events,
      startTime,
      endTime,
      videoEnd,
    );
    return this.displayDataCache[id];
  }

  generateMouseOptions(data) {
    return {
      onClick: (_, elements) => {
        if (elements.length < 1) {
          return;
        }
        const element = elements[0];
        const { y } = data.datasets[element.datasetIndex].data[element.index];

        this.props.onMarkerClick(y);
      },
      onHover: (event, elements) => {
        const style = event.native.target.style;
        style.cursor = elements.length > 0 ? 'pointer' : 'default';
      },
    };
  }

  generateToolTipOptions() {
    return {
      tooltip: {
        displayColors: false,
        bodyFont: {
          size: 14,
        },
        callbacks: {
          label: (tooltipItem) => {
            const { dataIndex, dataset } = tooltipItem;
            const { x, y, type } = dataset.data[dataIndex];

            const realTime = formatTimestamp(x);
            const videoTime = formatTimestamp(y);

            const typeLabel = this.props.intl.formatMessage(
              translations.eventTypeLabel,
              { type },
            );
            const realTimeLabel = this.props.intl.formatMessage(
              translations.eventRealTime,
              { realTime },
            );
            const videoTimeLabel = this.props.intl.formatMessage(
              translations.eventVideoTime,
              { videoTime },
            );

            return [typeLabel, '', realTimeLabel, videoTimeLabel];
          },
        },
      },
    };
  }

  processEvents(events, sessionStartTime, sessionEndTime, videoEndTime) {
    const processedEvents = events.map((event) => {
      const eventTime = Date.parse(event.eventTime);
      const x = (eventTime - sessionStartTime.getTime()) / 1000;
      const y = event.videoTime;
      const type = event.eventType;
      return { x, y, type };
    });

    const endTimeOffset =
      (sessionEndTime.getTime() - sessionStartTime.getTime()) / 1000;

    return [
      {
        x: 0,
        y: 0,
        type: this.props.intl.formatMessage(translations.sessionStartLabel),
      },
      ...processedEvents,
      {
        x: endTimeOffset,
        y: videoEndTime,
        type: this.props.intl.formatMessage(translations.sessionEndLabel),
      },
    ];
  }

  renderDropDown() {
    const sessionKeys = Object.keys(this.props.sessions);
    const items = sessionKeys.map((key) => {
      const session = this.props.sessions[key];
      const startTime = new Date(session.sessionStart);
      return (
        <MenuItem key={key} value={key}>
          {startTime.toLocaleString()}
        </MenuItem>
      );
    });

    return (
      <div className="mb-5 mt-5">
        <FormControl variant="standard">
          <InputLabel>
            {this.props.intl.formatMessage(translations.selectSession)}
          </InputLabel>
          <Select
            className="max-h-96 w-80"
            onChange={(event) =>
              this.setState({ selectedSessionId: event.target.value })
            }
            value={this.state.selectedSessionId}
            variant="standard"
          >
            {items}
          </Select>
        </FormControl>
      </div>
    );
  }

  renderPlot() {
    const displayData = this.computeData(this.state.selectedSessionId);
    if (!displayData) {
      return <Scatter />;
    }

    const data = {
      datasets: [
        {
          ...graphDataLineOptions,
          label: new Date(
            this.props.sessions[this.state.selectedSessionId].sessionStart,
          ).toLocaleString(),
          data: displayData,
        },
      ],
    };

    const globalOptions = graphGlobalOptions(
      this.props.intl,
      this.props.videoDuration,
    );

    return (
      <Scatter
        data={data}
        options={{
          ...globalOptions,
          plugins: {
            ...globalOptions.plugins,
            ...this.generateToolTipOptions(),
          },
          ...this.generateMouseOptions(data),
        }}
      />
    );
  }

  render() {
    if (this.props.videoDuration === videoDefaults.placeHolderDuration) {
      return <LoadingIndicator />;
    }

    return (
      <div>
        {this.renderDropDown()}
        {this.renderPlot()}
      </div>
    );
  }
}

ProgressGraph.propTypes = propTypes;
ProgressGraph.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  return {
    videoDuration: state.video.duration,
    ...ownProps,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onMarkerClick: (duration) => dispatch(seekToDirectly(duration)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(ProgressGraph));
