import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { Overlay } from 'react-overlays';
import { grey200, grey400, blue500 } from 'material-ui/styles/colors';

import AddCommentIcon from './AddCommentIcon';
import OverlayTooltip from './OverlayTooltip';
import Annotations from '../../containers/Annotations';
import { AnnotationProp } from '../../propTypes';

const styles = {
  editor: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: grey200,
    borderRadius: 5,
    padding: 5,
    width: '100%',
  },
  editorLine: {
    height: 20,
    paddingLeft: 5,
    whiteSpace: 'nowrap',
  },
  editorLineNumber: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: grey200,
    padding: '0 5px',
  },
  commentIcon: {
    color: grey400,
  },
  commentIconExpanded: {
    color: blue500,
  },
  chevronIcon: {
    fontSize: 10,
    transform: 'rotate(-90deg)',
  },
};

export default class NarrowEditor extends Component {
  renderCommentIcon(lineNumber) {
    const { expanded, annotations, toggleLine } = this.props;

    const annotation = annotations.find(a => a.line === lineNumber);
    const shouldShow = annotation || expanded[lineNumber - 1];

    return (
      <div
        ref={(c) => { this[`comment-${lineNumber}`] = c; }}
        onClick={() => toggleLine(lineNumber)}
        style={{ display: 'flex', visibility: shouldShow ? 'visible' : 'hidden', zIndex: 1000 }}
      >
        <i
          className="fa fa-comment"
          style={expanded[lineNumber - 1] ? styles.commentIconExpanded : styles.commentIcon}
        />
      </div>
    );
  }

  renderComments(lineNumber) {
    const { answerId, fileId, annotations, expanded, collapseLine } = this.props;
    const annotation = annotations.find(a => a.line === lineNumber);
    const placement = 'right';

    return (
      <Overlay
        show={expanded[lineNumber - 1]}
        onHide={() => collapseLine(lineNumber)}
        placement={placement}
        target={() => findDOMNode(this[`comment-${lineNumber}`])}
      >
        <OverlayTooltip placement={placement}>
          <Annotations answerId={answerId} fileId={fileId} lineNumber={lineNumber} annotation={annotation} />
        </OverlayTooltip>
      </Overlay>
    );
  }

  renderLineNumberColumn(lineNumber) {
    const { expandLine } = this.props;
    return (
      <div style={styles.editorLineNumber}>
        <div>
          {this.renderCommentIcon(lineNumber)}
          {this.renderComments(lineNumber)}
        </div>
        {lineNumber}
        <AddCommentIcon onClick={() => expandLine(lineNumber)} />
      </div>
    );
  }

  render() {
    /* eslint-disable react/no-array-index-key */
    /* eslint-disable react/no-danger */
    const { content } = this.props;
    return (
      <table className="codehilite" style={styles.editor}>
        <tbody>
          <tr>
            <td style={{ width: 75, userSelect: 'none' }}>
              {content.map((line, index) =>
                <div key={`${index}-${line}`}>
                  {this.renderLineNumberColumn(index + 1)}
                </div>
              )}
            </td>
            <td>
              {content.map((line, index) => (
                <div
                  key={`${index}-${line}`}
                  style={styles.editorLine}
                  dangerouslySetInnerHTML={{ __html: line }}
                />
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    );
    /* eslint-enable react/no-danger */
    /* eslint-enable react/no-array-index-key */
  }
}

NarrowEditor.propTypes = {
  expanded: PropTypes.arrayOf(PropTypes.bool).isRequired,
  answerId: PropTypes.number.isRequired,
  fileId: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(AnnotationProp),
  content: PropTypes.arrayOf(PropTypes.string).isRequired,
  expandLine: PropTypes.func,
  collapseLine: PropTypes.func,
  toggleLine: PropTypes.func,
};

NarrowEditor.defaultProps = {
  expandLine: () => {},
  collapseLine: () => {},
  toggleLine: () => {},
};
