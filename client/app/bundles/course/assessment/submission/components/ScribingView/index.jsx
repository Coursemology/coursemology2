import { Component } from 'react';
import PropTypes from 'prop-types';
import scribingViewLoader from 'course/assessment/submission/loaders/ScribingViewLoader';
import ScribingToolbar from './ScribingToolbar';
import ScribingCanvas from './ScribingCanvas';
import { submissionShape } from '../../propTypes';

const propTypes = {
  answerId: PropTypes.number.isRequired,
  submission: submissionShape,
};

const styles = {
  canvasDiv: {
    alignItems: 'center',
    margin: 'auto',
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
