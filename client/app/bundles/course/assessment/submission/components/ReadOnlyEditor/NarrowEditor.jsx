import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { Overlay } from 'react-overlays';
import { grey200, grey400 } from 'material-ui/styles/colors';

import AddCommentIcon from './AddCommentIcon';
import OverlayTooltip from './OverlayTooltip';
import Annotations from '../../containers/Annotations';
import { annotationShape } from '../../propTypes';

const styles = {
  editor: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: grey200,
    borderRadius: 5,
    padding: 5,
    width: '100%',
    tableLayout: 'fixed',
  },
  editorLine: {
    height: 20,
    paddingLeft: 5,
    whiteSpace: 'nowrap',
    overflow: 'visible',
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
  editorLineNumberWithComments: {
    alignItems: 'center',
    backgroundColor: grey400,
    display: 'flex',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: grey200,
    padding: '0 5px',
  },
};

export default class NarrowEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeComment: 0,
      lineHovered: 0,
    };
  }

  toggleComment(lineNumber) {
    this.props.toggleLine(lineNumber);
    this.setState({ activeComment: lineNumber });
  }

  expandComment(lineNumber) {
    this.props.expandLine(lineNumber);
    this.setState({ activeComment: lineNumber });
  }

  renderComments(lineNumber) {
    const { activeComment } = this.state;
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
        <OverlayTooltip
          placement={placement}
          style={{ zIndex: activeComment === lineNumber ? 9999 : lineNumber }}
        >
          <div onClick={() => this.setState({ activeComment: lineNumber })}>
            <Annotations answerId={answerId} fileId={fileId} lineNumber={lineNumber} annotation={annotation} />
          </div>
        </OverlayTooltip>
      </Overlay>
    );
  }

  renderLineNumberColumn(lineNumber) {
    const { lineHovered } = this.state;
    const { annotations } = this.props;
    const annotation = annotations.find(a => a.line === lineNumber);
    return (
      <div
        style={annotation ? styles.editorLineNumberWithComments : styles.editorLineNumber}
        onClick={() => this.toggleComment(lineNumber)}
        onMouseOver={() => this.setState({ lineHovered: lineNumber })}
        onMouseOut={() => this.setState({ lineHovered: 0 })}
      >
        <div ref={(c) => { this[`comment-${lineNumber}`] = c; }}>
          {lineNumber}
        </div>
        {this.renderComments(lineNumber)}
        <AddCommentIcon onClick={() => this.expandComment(lineNumber)} hovered={lineHovered === lineNumber} />
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
            <td style={{ width: 50, userSelect: 'none', paddingBottom: 20 }}>
              {content.map((line, index) =>
                <div key={`${index}-${line}`}>
                  {this.renderLineNumberColumn(index + 1)}
                </div>
              )}
            </td>
            <td style={{ display: 'block', overflowX: 'scroll' }}>
              <div style={{ display: 'inline-block' }}>
                {content.map((line, index) => (
                  <div key={`${index}-${line}`} style={styles.editorLine} >
                    <pre style={{ overflow: 'visible' }}>
                      <code
                        dangerouslySetInnerHTML={{ __html: line }}
                        style={{ whiteSpace: 'inherit' }}
                      /></pre>
                  </div>
                ))}
              </div>
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
  annotations: PropTypes.arrayOf(annotationShape),
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
