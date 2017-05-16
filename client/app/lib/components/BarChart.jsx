import React from 'react';
import PropTypes from 'prop-types';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

const colors = {
  red: '#ffaaaa',
  yellow: '#fffbaa',
  grey: '#dddddd',
  blue: '#aaeeff',
  green: '#adffaa',
};

const styles = {
  bar: {
    width: '100%',
    borderRadius: 10,
    display: 'flex',
    overflow: 'hidden',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  segment: {
    height: 15,
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 4,
  },
};

class BarChart extends React.Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
      count: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
    })).isRequired,
  }

  renderChart(total) {
    return (
      <div style={styles.bar}>
        {
          this.props.data.map((segment) => {
            const segmentStyle = {
              width: `${(100 * segment.count) / total}%`,
              height: styles.segment.height,
              backgroundColor: colors[segment.color],
            };
            return <div key={segment.color} style={segmentStyle} />;
          })
        }
      </div>
    );
  }

  renderLegend() {
    return (
      <div style={styles.legend}>
        {
          this.props.data.map(segment => (
            <Chip key={segment.color} style={styles.chip} >
              <Avatar backgroundColor={colors[segment.color]} />
              { segment.count }
              { ' ' }
              { segment.label }
            </Chip>
          ))
        }
      </div>
    );
  }

  render() {
    const total = this.props.data.reduce((sum, segment) => sum + segment.count, 0);
    if (total < 1) { return <div />; }

    return (
      <div>
        { this.renderChart(total) }
        { this.renderLegend() }
      </div>
    );
  }
}

export default BarChart;
