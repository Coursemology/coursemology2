import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  onClick: PropTypes.func.isRequired,
};

class DeleteButton extends React.Component {
  render() {
    return (
      <span className="btn btn-danger danger" title="Delete Announcement" onClick={() => this.props.onClick()}>
        <i className="fa fa-trash" />
      </span>
    );
  }
}

DeleteButton.propTypes = propTypes;

export default DeleteButton;
