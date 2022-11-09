import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';

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
          data-for={segment.color}
          data-tip={true}
          style={segmentStyle}
        >
          {segment.count > 0 ? segment.count : null}
          <ReactTooltip effect="solid" id={segment.color}>
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
