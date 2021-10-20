import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  label: {
    border: '1px solid #B0BEC5',
    borderBottom: 0,
    padding: '5px 16px',
  },
  labelEdited: {
    border: '1px solid #B0BEC5',
    backgroundColor: '#FFCC80',
  },
  labelDeleted: {
    border: '1px solid #B0BEC5',
    backgroundColor: '#F48FB1',
  },
  labelWidth: {
    width: 20,
  },
};

function Labels({ post }) {
  const isPostUpdated = post.isUpdated === true;
  const isPostDeleted = post.isDeleted === true;
  return (
    <>
      {isPostUpdated && !isPostDeleted && (
        <div style={{ ...styles.label, ...styles.labelEdited }}>
          <i
            className="fa fa-refresh"
            aria-hidden="true"
            style={styles.labelWidth}
          />
          Post has been edited in the forum. Showing post last saved.
        </div>
      )}
      {isPostDeleted && (
        <div style={{ ...styles.label, ...styles.labelDeleted }}>
          <i
            className="fa fa-trash"
            aria-hidden="true"
            style={styles.labelWidth}
          />
          Post has been deleted from forum topic. Showing post last saved.
        </div>
      )}
    </>
  );
}

Labels.propTypes = {
  post: PropTypes.object.isRequired,
};

export default Labels;
