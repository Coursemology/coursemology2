import React from 'react';
import PropTypes from 'prop-types';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { Scatter } from 'react-chartjs-2';
import { injectIntl, intlShape } from 'react-intl';
import { formatTimestamp } from 'lib/helpers/videoHelpers';
import { videoDefaults } from 'lib/constants/videoConstants';
import { connect } from 'react-redux';

import translations from '../../translations';
import { seekToDirectly } from '../../actions/video';

const graphGlobalOptions = (intl, videoDuration) => ({
  legend: {
    display: false,
  },
  elements: {
    point: {
      borderWidth: 3,
      hoverBorderWidth: 2,
      hoverRadius: 5,
      radius: 5,
      hitRadius: 10,
    },
    line: {
      tension: 0,
    },
  },
  scales: {
    xAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: intl.formatMessage(translations.eventRealTimeLabel),
          fontSize: 15,
        },
        ticks: {
          suggestedMin: 0,
          callback: formatTimestamp,
        },
      },
    ],
    yAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: intl.formatMessage(translations.eventVideoTimeLabel),
          fontSize: 15,
        },
        ticks: {
          suggestedMin: 0,
          max: videoDuration,
          callback: formatTimestamp,
        },
      },
    ],
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
  intl: intlShape.isRequired,

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
        })
      ),
    })
  ).isRequired,
  videoDuration: PropTypes.number.isRequired,
  onMarkerClick: PropTypes.func,
};

const defaultProps = {
  onMarkerClick: () => {},
};

class ProgressGraph extends React.Component {
  constructor(props) {
    super(props);
    this.displayDataCache = {};

    this.state = { selectedSessionId: Object.keys(props.sessions)[0] };
  }

  componentWillReceiveProps(nextProps) {
    this.displayDataCache = {};
    if (!nextProps[this.state.selectedSessionId]) {
      this.setState({ selectedSessionId: Object.keys(nextProps.sessions)[0] });
    }
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
      videoEnd
    );
    return this.displayDataCache[id];
  }

  generateToolTipOptions() {
    return {
      tooltips: {
        displayColors: false,
        bodyFontSize: 14,
        callbacks: {
          label: (tooltipItem, graphData) => {
            const { datasetIndex, index } = tooltipItem;
            const { x, y, type } = graphData.datasets[datasetIndex].data[index];

            const realTime = formatTimestamp(x);
            const videoTime = formatTimestamp(y);

            const typeLabel = this.props.intl.formatMessage(
              translations.eventTypeLabel,
              { type }
            );
            const realTimeLabel = this.props.intl.formatMessage(
              translations.eventRealTime,
              { realTime }
            );
            const videoTimeLabel = this.props.intl.formatMessage(
              translations.eventVideoTime,
              { videoTime }
            );

            return [typeLabel, '', realTimeLabel, videoTimeLabel];
          },
        },
      },
    };
  }

  generateMouseOptions(data) {
    return {
      onClick: (_, elements) => {
        if (elements.length < 1) {
          return;
        }
        const element = elements[0];
        const { y } = data.datasets[element._datasetIndex].data[element._index];

        this.props.onMarkerClick(y);
      },
      hover: {
        onHover: (event, elements) => {
          const style = event.target.style;
          style.cursor = elements.length > 0 ? 'pointer' : 'default';
        },
      },
    };
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
            this.props.sessions[this.state.selectedSessionId].sessionStart
          ).toLocaleString(),
          data: displayData,
        },
      ],
    };

    return (
      <Scatter
        data={data}
        options={{
          ...graphGlobalOptions(this.props.intl, this.props.videoDuration),
          ...this.generateMouseOptions(data),
          ...this.generateToolTipOptions(),
        }}
      />
    );
  }

  renderDropDown() {
    const sessionKeys = Object.keys(this.props.sessions);
    const items = sessionKeys.map((key) => {
      const session = this.props.sessions[key];
      const startTime = new Date(session.sessionStart);
      return (
        <MenuItem
          key={key}
          value={key}
          primaryText={startTime.toLocaleString()}
        />
      );
    });

    return (
      <SelectField
        floatingLabelText={this.props.intl.formatMessage(
          translations.selectSession
        )}
        maxHeight={300}
        value={this.state.selectedSessionId}
        onChange={(_event, _key, selectedSessionId) =>
          this.setState({ selectedSessionId })
        }
      >
        {items}
      </SelectField>
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
  mapDispatchToProps
)(injectIntl(ProgressGraph));
