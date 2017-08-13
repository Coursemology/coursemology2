import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as actions from '../actions/scribing';
import ScribingViewComponent from '../components/ScribingView';

class ScribingViewContainer extends Component {
  render() {
    return (
      <ScribingViewComponent {...this.props} />
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { answerId } = ownProps;
  return {
    scribing: state.scribing[answerId],
    submission: state.submission,
  };
}

const ScribingView = connect(
  mapStateToProps, actions
)(ScribingViewContainer);
export default ScribingView;
