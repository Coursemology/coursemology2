import { useState } from 'react';
import 'react-tippy/dist/tippy.css';
import { Tooltip } from 'react-tippy';
import PropTypes from 'prop-types';

const styles = {
  wrapper: {
    borderRadius: '50%',
    cursor: 'pointer',
    height: 16,
    width: 16,
  },
};

const Tag = (props) => {
  const { backgroundColor, tagName } = props;

  const [isShowing, setIsShowing] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsShowing(true)}
      onMouseLeave={() => setIsShowing(false)}
      style={{ ...styles.wrapper, backgroundColor }}
    >
      <Tooltip title={tagName} open={isShowing} />
    </div>
  );
};

Tag.propTypes = {
  backgroundColor: PropTypes.string.isRequired,
  tagName: PropTypes.string.isRequired,
};

export default Tag;
