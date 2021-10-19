import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  errorBox: {
    border: '1px solid #B71C1C',
    borderLeft: '10px solid #B71C1C',
    borderRadius: 12,
    padding: '5px 18px',
    marginTop: 10,
    marginBottom: 10,
    color: '#B71C1C',
  },
};

export default function Error({ message }) {
  return (
    <div style={styles.errorBox}>
      <i className="fa fa-exclamation-triangle" aria-hidden="true" />
      &nbsp;
      {message}
    </div>
  );
}

Error.propTypes = {
  message: PropTypes.string,
};
