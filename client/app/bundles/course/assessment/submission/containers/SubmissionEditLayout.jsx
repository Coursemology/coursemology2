import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
