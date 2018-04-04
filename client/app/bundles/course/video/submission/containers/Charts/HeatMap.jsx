import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Bar } from 'react-chartjs-2';
import { injectIntl, intlShape } from 'react-intl';
import { formatTimestamp } from 'lib/helpers/videoHelpers';
import { videoDefaults } from 'lib/constants/videoConstants';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { seekToDirectly } from '../../actions/video';
import translations from '../../translations';

const graphGlobalOptions = {
  legend: {
    display: false,
  },
  scales: {
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Video time',
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
};

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
const heightScale = 0.85;

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

  calculateWidthAndResolution() {
    const widthCandidate = (this.props.videoDuration * preferredExpandedBarWidth) + expandedChartOffset;

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

    const [width, resolution] = this.calculateWidthAndResolution();

    const options = {
      maintainAspectRatio: false,
      devicePixelRatio: resolution,
      ...graphGlobalOptions,
      ...this.mouseOptions,
    };

    return (
      <div style={{ overflowX: 'scroll' }}>
        <div style={{ width }}>
          <Bar data={data} options={options} height={(window.innerHeight - heightOffset) * heightScale} />
        </div>
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

