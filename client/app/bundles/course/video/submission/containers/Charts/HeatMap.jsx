import { Component } from 'react';
import { Bar } from 'react-chartjs-2';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { FormControlLabel, Switch } from '@mui/material';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { videoDefaults } from 'lib/constants/videoConstants';
import { formatTimestamp } from 'lib/helpers/videoHelpers';

import { seekToDirectly } from '../../actions/video';
import translations from '../../translations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const graphGlobalOptions = (intl) => ({
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: intl.formatMessage(translations.eventVideoTimeLabel),
        fontSize: 15,
      },
      suggestedMin: 0,
    },
    y: {
      title: {
        display: true,
        text: 'Watch Frequency',
        fontSize: 15,
      },
      suggestedMin: 0,
    },
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
  const widthCandidate =
    duration * preferredExpandedBarWidth + expandedChartOffset;

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
  intl: PropTypes.object.isRequired,

  watchFrequency: PropTypes.arrayOf(PropTypes.number).isRequired,
  videoDuration: PropTypes.number.isRequired,
  onBarClick: PropTypes.func,
};

const defaultProps = {
  onBarClick: () => {},
};

class HeatMap extends Component {
  static renderUnscaledChart(data, options) {
    return (
      <div className="w-full">
        <Bar
          data={data}
          height={(window.innerHeight - heightOffset) * heightScale}
          options={options}
        />
      </div>
    );
  }

  mouseOptions = {
    onClick: (_, elements) => {
      if (elements.length < 1) {
        return;
      }
      this.props.onBarClick(elements[0].index); // Index is the video time
    },
    onHover: (event, elements) => {
      const style = event.native.target.style;
      style.cursor = elements.length > 0 ? 'pointer' : 'default';
    },
  };

  constructor(props) {
    super(props);
    this.state = { scaledMode: false };
  }

  generateToolTipOptions() {
    return {
      tooltip: {
        displayColors: false,
        callbacks: {
          title: (tooltipItem) => {
            const videoTime = tooltipItem[0].label;
            return this.props.intl.formatMessage(translations.eventVideoTime, {
              videoTime,
            });
          },
          label: (tooltipItem) => {
            const { dataIndex, dataset } = tooltipItem;
            const watchFrequency = dataset.data[dataIndex];
            return this.props.intl.formatMessage(translations.watchFrequency, {
              watchFrequency,
            });
          },
        },
      },
    };
  }

  renderScaledChart(data, options) {
    const [width, resolution] = calculateWidthAndResolution(
      this.props.videoDuration,
    );

    const optionsWithResolution = {
      ...options,
      devicePixelRatio: resolution,
    };

    return (
      <div className="overflow-x-scroll">
        <div style={{ width }}>
          <Bar
            data={data}
            height={(window.innerHeight - heightOffset) * heightScale}
            options={optionsWithResolution}
          />
        </div>
      </div>
    );
  }

  render() {
    if (this.props.videoDuration === videoDefaults.placeHolderDuration) {
      return <LoadingIndicator />;
    }

    const data = {
      labels: Array(this.props.videoDuration)
        .fill(null)
        .map((_, id) => formatTimestamp(id)),
      datasets: [
        {
          ...barDataOptions,
          data: this.props.watchFrequency,
        },
      ],
    };

    const globalOptions = graphGlobalOptions(this.props.intl);

    const options = {
      ...globalOptions,
      plugins: {
        ...globalOptions.plugins,
        ...this.generateToolTipOptions(),
      },
      ...this.mouseOptions,
    };

    const chartElem = this.state.scaledMode
      ? this.renderScaledChart(data, options)
      : HeatMap.renderUnscaledChart(data, options);
    return (
      <div>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.scaledMode}
              color="primary"
              onChange={(_, toggled) => {
                this.setState({ scaledMode: toggled });
              }}
            />
          }
          label={
            <b>
              {this.props.intl.formatMessage(translations.barGraphScalingLabel)}
            </b>
          }
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
    onBarClick: (duration) => dispatch(seekToDirectly(duration)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(HeatMap));
