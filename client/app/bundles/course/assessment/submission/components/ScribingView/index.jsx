import React from 'react';
import PropTypes from 'prop-types';
import scribingViewLoader from 'course/assessment/submission/loaders/ScribingViewLoader';
import ScribingToolbar from './ScribingToolbar';
import ScribingCanvas from './ScribingCanvas';
import style from './ScribingView.scss'; // eslint-disable-line no-unused-vars
import { submissionShape } from '../../propTypes';

const propTypes = {
  answerId: PropTypes.number.isRequired,
  submission: submissionShape,
};

const styles = {
  canvas_div: {
    alignItems: 'center',
    margin: 'auto',
  },
};

export default class ScribingViewComponent extends React.Component {
  componentWillMount() {
    scribingViewLoader().then(() => {
      this.forceUpdate();
    });
  }

  render() {
    const { answerId, submission } = this.props;
    return (answerId ?
      <div style={styles.canvas_div}>
        {submission.canUpdate ? <ScribingToolbar {...this.props} /> : null }
        <ScribingCanvas {...this.props} />
      </div> : null
    );
  }
}

ScribingViewComponent.propTypes = propTypes;
