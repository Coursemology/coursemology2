import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

const styles = {
  bar: {
    borderRadius: 10,
    display: 'flex',
    overflow: 'hidden',
    textAlign: 'center',
  },
  segment: {
    height: 15,
  },
  chip: {
    margin: 4,
  },
};

// props.data[i] = {count: number, color: hex, label: <FormattedMessage/>}
const BarChart = (props) => (
  <div style={styles.bar}>
    {props.data.map((segment) => {
      const segmentStyle = {
        transition: 'flex .5s, min-width .5s',
        flex: segment.count,
        minWidth: segment.count > 0 ? 50 : 0,
        backgroundColor: segment.color,
      };
      return (
        <div
          key={segment.color}
          style={segmentStyle}
          data-tip
          data-for={segment.color}
        >
          {segment.count > 0 ? segment.count : null}
          <ReactTooltip id={segment.color} effect="solid">
            {segment.label}
          </ReactTooltip>
        </div>
      );
    })}
  </div>
);

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      count: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
    }),
  ).isRequired,
};

export default BarChart;
