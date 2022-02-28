import { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Paper } from '@material-ui/core';

import Annotations from '../../containers/Annotations';
import PostPreview from '../../containers/PostPreview';
import { annotationShape } from '../../propTypes';

const styles = {
  collapsed: {
    height: 20,
  },
  expanded: {
    maxHeight: 20,
    overflow: 'visible',
    position: 'relative',
    zIndex: 5,
  },
  postPreview: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  minimiseButton: {
    height: 20,
    width: '100%',
  },
};

export default class WideComments extends Component {
  renderComments(lineNumber, annotation) {
    const {
      activeComment,
      answerId,
      fileId,
      expanded,
      expandLine,
      collapseLine,
      onClick,
    } = this.props;

    if (expanded[lineNumber - 1]) {
      return (
        <div
          key={lineNumber}
          style={{
            ...styles.expanded,
            zIndex:
              activeComment === lineNumber
                ? 1000
                : lineNumber + styles.expanded.zIndex,
          }}
          onClick={() => onClick(lineNumber)}
        >
          <Button
            variant="contained"
            onClick={() => collapseLine(lineNumber)}
            style={styles.minimiseButton}
          >
            <span className="fa fa-chevron-down" />
          </Button>
          <Annotations
            answerId={answerId}
            fileId={fileId}
            lineNumber={lineNumber}
            annotation={annotation}
          />
        </div>
      );
    }
    return (
      <Paper
        key={lineNumber}
        style={styles.collapsed}
        elevation={1}
        onClick={() => expandLine(lineNumber)}
      >
        <PostPreview style={styles.postPreview} annotation={annotation} />
      </Paper>
    );
  }

  render() {
    const { expanded, annotations } = this.props;
    const comments = [];
    for (let i = 1; i <= expanded.length; i++) {
      const filtered = annotations.filter(
        (annotation) => annotation.line === i,
      );
      if (filtered.length > 0 || expanded[i - 1]) {
        comments.push(this.renderComments(i, filtered[0]));
      } else {
        comments.push(<div style={styles.collapsed} key={i} />);
      }
    }
    return <div style={{ paddingBottom: 20 }}>{comments}</div>;
  }
}

WideComments.propTypes = {
  activeComment: PropTypes.number.isRequired,
  answerId: PropTypes.number.isRequired,
  fileId: PropTypes.number.isRequired,
  expanded: PropTypes.arrayOf(PropTypes.bool).isRequired,
  annotations: PropTypes.arrayOf(annotationShape),
  expandLine: PropTypes.func,
  collapseLine: PropTypes.func,
  onClick: PropTypes.func,
};

WideComments.defaultProps = {
  annotations: [],
  expandLine: () => {},
  collapseLine: () => {},
  onClick: () => {},
};
