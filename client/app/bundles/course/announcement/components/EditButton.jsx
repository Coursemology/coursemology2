import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  onClick: PropTypes.func.isRequired,
};

class EditButton extends React.Component {
  render() {
    return (
      <span className="btn btn-default edit" title="Edit Announcement" onClick={() => this.props.onClick()}>
        <i className="fa fa-edit" />
      </span>
    );
  }
}

EditButton.propTypes = propTypes;

export default EditButton;
