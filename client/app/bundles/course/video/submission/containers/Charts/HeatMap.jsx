import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import Toggle from 'material-ui/Toggle';
import { injectIntl, intlShape } from 'react-intl';
import { formatTimestamp } from 'lib/helpers/videoHelpers';
import { videoDefaults } from 'lib/constants/videoConstants';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { seekToDirectly } from '../../actions/video';
import translations from '../../translations';

const graphGlobalOptions = intl => ({
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: intl.formatMessage(translations.eventVideoTimeLabel),
        fontSize: 15,
      },
      ticks: {
        suggestedMin: 0,
      },
    }],
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Watch Frequency',
        fontSize: 15,
      },
      ticks: {
        suggestedMin: 0,
        stepSize: 1,
      },
    }],
  },
});

const barDataOptions = {
  backgroundColor: 'rgba(75,192,192, 1)',
  borderColor: 'rgba(75,192,192,1)',
};

const preferredExpandedBarWidth = 10;
const expandedChartOffset = 100;
const fullResWidthThreshold = 16000;
const minResolution = 0.8;
const maxWidth = fullResWidthThreshold / minResolution;
const minWidth = 300;
const heightOffset = 100;
const heightScale = 0.9;

function calculateWidthAndResolution(duration) {
  const widthCandidate = (duration * preferredExpandedBarWidth) + expandedChartOffset;

  if (widthCandidate > maxWidth) {
    return [maxWidth, minResolution];
  }

  if (widthCandidate > fullResWidthThreshold) {
    return [widthCandidate, fullResWidthThreshold / widthCandidate];
  }

  if (widthCandidate < minWidth) {
    return [minWidth, 1];
  }

  return [widthCandidate, 1];
}

const propTypes = {
  intl: intlShape.isRequired,

  watchFrequency: PropTypes.arrayOf(PropTypes.number).isRequired,
  videoDuration: PropTypes.number.isRequired,
  onBarClick: PropTypes.func,
};

const defaultProps = {
  onBarClick: () => {},
};

class HeatMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = { scaledMode: false };
  }

  mouseOptions = {
    onClick: (_, elements) => {
      if (elements.length < 1) {
        return;
      }
      this.props.onBarClick(elements[0]._index); // Index is the video time
    },
    hover: {
      onHover: (event, elements) => {
        const style = event.target.style;
        style.cursor = elements.length > 0 ? 'pointer' : 'default';
      },
    },
  };

  generateToolTipOptions() {
    return {
      tooltips: {
        displayColors: false,
        callbacks: {
          title: (tooltipItem) => {
            const videoTime = tooltipItem[0].xLabel;
            return this.props.intl.formatMessage(translations.eventVideoTime, { videoTime });
          },
          label: (tooltipItem, graphData) => {
            const { datasetIndex, index } = tooltipItem;
            const watchFrequency = graphData.datasets[datasetIndex].data[index];
            return this.props.intl.formatMessage(translations.watchFrequency, { watchFrequency });
          },
        },
      },
    };
  }

  renderScaledChart(data, options) {
    const [width, resolution] = calculateWidthAndResolution(this.props.videoDuration);

    const optionsWithResolution = {
      ...options,
      devicePixelRatio: resolution,
    };

    return (
      <div style={{ overflowX: 'scroll' }}>
        <div style={{ width }}>
          <Bar data={data} options={optionsWithResolution} height={(window.innerHeight - heightOffset) * heightScale} />
        </div>
      </div>
    );
  }

  static renderUnscaledChart(data, options) {
    return (
      <div style={{ width: '100%' }}>
        <Bar data={data} options={options} height={(window.innerHeight - heightOffset) * heightScale} />
      </div>
    );
  }

  render() {
    if (this.props.videoDuration === videoDefaults.placeHolderDuration) {
      return <LoadingIndicator />;
    }

    const data = {
      labels: Array(this.props.videoDuration).fill(null).map((_, id) => formatTimestamp(id)),
      datasets: [
        {
          ...barDataOptions,
          data: this.props.watchFrequency,
        },
      ],
    };

    const options = {
      ...graphGlobalOptions(this.props.intl),
      ...this.generateToolTipOptions(),
      ...this.mouseOptions,
    };

    const chartElem =
      this.state.scaledMode ? this.renderScaledChart(data, options) : HeatMap.renderUnscaledChart(data, options);
    return (
      <div>
        <Toggle
          label={this.props.intl.formatMessage(translations.barGraphScalingLabel)}
          labelPosition="right"
          onToggle={(_, toggled) => {
            this.setState({ scaledMode: toggled });
          }}
          toggled={this.state.scaledMode}
        />
        <br />
        {chartElem}
      </div>
    );
  }
}

HeatMap.propTypes = propTypes;
HeatMap.defaultProps = defaultProps;

function mapStateToProps(state, ownProps) {
  return {
    videoDuration: state.video.duration,
    ...ownProps,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onBarClick: duration => dispatch(seekToDirectly(duration)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(HeatMap));

