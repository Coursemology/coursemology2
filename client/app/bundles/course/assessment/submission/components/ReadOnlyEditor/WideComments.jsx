import { Component } from 'react';
import { ExpandMore } from '@mui/icons-material';
import { Button, Paper } from '@mui/material';
import PropTypes from 'prop-types';

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
      isUpdatingAnnotationAllowed,
    } = this.props;

    if (expanded[lineNumber - 1]) {
      return (
        <div
          key={lineNumber}
          onClick={() => onClick(lineNumber)}
          style={{
            ...styles.expanded,
            zIndex:
              activeComment === lineNumber
                ? 1000
                : lineNumber + styles.expanded.zIndex,
          }}
        >
          <Button
            color="info"
            onClick={() => collapseLine(lineNumber)}
            style={styles.minimiseButton}
            variant="outlined"
          >
            <ExpandMore />
          </Button>
          <Annotations
            annotation={annotation}
            answerId={answerId}
            fileId={fileId}
            isUpdatingAnnotationAllowed={isUpdatingAnnotationAllowed}
            lineNumber={lineNumber}
          />
        </div>
      );
    }
    if (annotation) {
      return (
        <Paper
          key={lineNumber}
          elevation={1}
          onClick={() => expandLine(lineNumber)}
          style={styles.collapsed}
        >
          <PostPreview annotation={annotation} />
        </Paper>
      );
    }
    return null;
  }

  render() {
    const { expanded, annotations, activeComment } = this.props;
    const comments = [];
    for (let i = 1; i <= expanded.length; i++) {
      const annotation = annotations.find((a) => a.line === i);
      if (annotation || (activeComment === i && expanded[i - 1])) {
        comments.push(this.renderComments(i, annotation));
      } else {
        comments.push(<div key={i} style={styles.collapsed} />);
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
  isUpdatingAnnotationAllowed: PropTypes.bool,
};

WideComments.defaultProps = {
  annotations: [],
  expandLine: () => {},
  collapseLine: () => {},
  onClick: () => {},
};
