import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';

import Annotations from '../../containers/Annotations';
import PostPreview from '../../containers/PostPreview';
import { AnnotationProp } from '../../propTypes';

const styles = {
  collapsed: {
    height: 20,
    overflow: 'hidden',
  },
  expanded: {
    maxHeight: 20,
    overflow: 'visible',
    position: 'relative',
  },
  minimiseButton: {
    height: 20,
    width: '100%',
  },
};

export default class WideComments extends Component {
  renderComments(lineNumber, annotation) {
    const { answerId, fileId, expanded, expandLine, collapseLine } = this.props;

    if (expanded[lineNumber - 1]) {
      return (
        <div key={lineNumber} style={styles.expanded}>
          <RaisedButton
            style={styles.minimiseButton}
            onClick={() => collapseLine(lineNumber)}
          >
            Click to close
          </RaisedButton>
          <Annotations answerId={answerId} fileId={fileId} lineNumber={lineNumber} annotation={annotation} />
        </div>
      );
    }
    return (
      <Paper
        key={lineNumber}
        style={styles.collapsed}
        zDepth={1}
        onClick={() => expandLine(lineNumber)}
      >
        <PostPreview annotation={annotation} />
      </Paper>
    );
  }

  render() {
    const { expanded, annotations } = this.props;
    const comments = [];
    for (let i = 1; i <= expanded.length; i++) {
      const filtered = annotations.filter(annotation => annotation.line === i);
      if (filtered.length > 0) {
        comments.push(this.renderComments(i, filtered[0]));
      } else {
        comments.push(<div style={styles.collapsed} key={i} />);
      }
    }
    return <div>{comments}</div>;
  }
}

WideComments.propTypes = {
  answerId: PropTypes.number.isRequired,
  fileId: PropTypes.number.isRequired,
  expanded: PropTypes.arrayOf(PropTypes.bool).isRequired,
  annotations: PropTypes.arrayOf(AnnotationProp),
  expandLine: PropTypes.func,
  collapseLine: PropTypes.func,
};

WideComments.defaultProps = {
  annotations: [],
  expandLine: () => {},
  collapseLine: () => {},
};
