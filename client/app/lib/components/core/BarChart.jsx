import { Tooltip } from 'react-tooltip';
import { Typography } from '@mui/material';
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
          data-tooltip-id={segment.color}
          style={segmentStyle}
        >
          {segment.count > 0 ? (
            <Typography variant="caption">{segment.count}</Typography>
          ) : null}

          <Typography variant="caption">
            <Tooltip id={segment.color}>{segment.label}</Tooltip>
          </Typography>
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
