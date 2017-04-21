import React, { Component, PropTypes } from 'react';

export default class SubmissionEditLayout extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

SubmissionEditLayout.propTypes = {
  children: PropTypes.node,
};
