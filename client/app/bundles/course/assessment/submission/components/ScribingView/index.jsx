import { Component } from 'react';
import PropTypes from 'prop-types';

import scribingViewLoader from 'course/assessment/submission/loaders/ScribingViewLoader';

import { submissionShape } from '../../propTypes';

import ScribingCanvas from './ScribingCanvas';
import ScribingToolbar from './ScribingToolbar';

const propTypes = {
  answerId: PropTypes.number.isRequired,
  submission: submissionShape,
};

const styles = {
  canvasDiv: {
    alignItems: 'center',
    marginBottom: 8,
  },
};

export default class ScribingViewComponent extends Component {
  UNSAFE_componentWillMount() {
    scribingViewLoader().then(() => {
      this.forceUpdate();
    });
  }

  render() {
    const { answerId, submission } = this.props;
    return answerId ? (
      <div style={styles.canvasDiv}>
        {submission.canUpdate ? (
          <ScribingToolbar
            key={`ScribingToolbar-${answerId}`}
            {...this.props}
          />
        ) : null}
        <ScribingCanvas key={`ScribingCanvas-${answerId}`} {...this.props} />
      </div>
    ) : null;
  }
}

ScribingViewComponent.propTypes = propTypes;
