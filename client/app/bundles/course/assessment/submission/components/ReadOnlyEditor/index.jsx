import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { Overlay } from 'react-overlays';
import { grey200, blue500 } from 'material-ui/styles/colors';

import Checkbox from './Checkbox';
import WideComments from './WideComments';
import OverlayTooltip from './OverlayTooltip';
import AddCommentIcon from './AddCommentIcon';
import Annotations from '../../containers/Annotations';
import { AnnotationProp } from '../../propTypes';

const EDITOR_THRESHOLD = 768;
const EDITOR_MODE_NARROW = 'narrow';
const EDITOR_MODE_WIDE = 'wide';

const styles = {
  readOnlyEditor: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: grey200,
    borderRadius: 5,
    padding: 5,
    width: '100%',
  },
  readOnlyEditorLineNumber: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: grey200,
    padding: '0 5px',
  },
  readOnlyEditorLineContent: {
    paddingLeft: 5,
  },
  commentIcon: {
    color: blue500,
  },
  chevronIcon: {
    fontSize: 10,
  },
  chevronIconCollapsed: {
    fontSize: 10,
    transform: 'rotate(-90deg)',
  },
};

export default class ReadOnlyEditor extends Component {
  static propTypes = {
    answerId: PropTypes.number.isRequired,
    fileId: PropTypes.number.isRequired,
    annotations: PropTypes.arrayOf(AnnotationProp),
    content: PropTypes.arrayOf(PropTypes.string),
  }

  static defaultProps = {
    content: [],
  };

  constructor(props) {
    super(props);

    const expanded = [];
    for (let i = 0; i < props.content.length; i += 1) {
      expanded.push(false);
    }

    const initialEditorMode = window.innerWidth < EDITOR_THRESHOLD ? EDITOR_MODE_NARROW : EDITOR_MODE_WIDE;
    this.state = { expanded, editorMode: initialEditorMode };
  }

  componentDidMount() {
    window.addEventListener('resize', this.windowResizing.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResizing.bind(this));
  }

  setAllCommentStateExpanded() {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded.forEach((_, index) => { newExpanded[index] = true; });
    this.setState({ expanded: newExpanded });
  }

  setAllCommentStateCollapsed() {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded.forEach((_, index) => { newExpanded[index] = false; });
    this.setState({ expanded: newExpanded });
  }

  setCommentState(lineNumber, state) {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded[lineNumber - 1] = state;
    this.setState({ expanded: newExpanded });
  }

  windowResizing(e) {
    if (e.currentTarget.innerWidth < EDITOR_THRESHOLD) {
      this.setState({ editorMode: EDITOR_MODE_NARROW });
    } else {
      this.setState({ editorMode: EDITOR_MODE_WIDE });
    }
  }

  toggleCommentState(lineNumber) {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded[lineNumber - 1] = !newExpanded[lineNumber - 1];
    this.setState({ expanded: newExpanded });
  }

  renderExpandAllCheckbox() {
    const { expanded } = this.state;
    return (
      <div style={{ display: 'flex', marginBottom: 5 }}>
        <Checkbox
          style={{ marginRight: 5 }}
          onChange={(e) => {
            if (e.target.checked) {
              this.setAllCommentStateExpanded();
            } else {
              this.setAllCommentStateCollapsed();
            }
          }}
          checked={expanded.indexOf(false) === -1}
          indeterminate={expanded.indexOf(true) !== -1 && expanded.indexOf(false) !== -1}
        />
        Expand all comments
      </div>
    );
  }

  renderCommentIcon(lineNumber) {
    const { expanded } = this.state;
    const { annotations } = this.props;

    const annotation = annotations.find(a => a.line === lineNumber);
    const shouldShow = annotation || expanded[lineNumber - 1];

    return (
      <div
        ref={(c) => { this[`comment-${lineNumber}`] = c; }}
        onClick={() => this.toggleCommentState(lineNumber)}
        style={{ display: 'flex', visibility: shouldShow ? 'visible' : 'hidden', zIndex: 1000 }}
      >
        <i className="fa fa-comment" style={styles.commentIcon} />
        <i
          className="fa fa-chevron-down"
          style={expanded[lineNumber - 1] ? styles.chevronIcon : styles.chevronIconCollapsed}
        />
      </div>
    );
  }

  renderComments(lineNumber) {
    const { expanded } = this.state;
    const { answerId, fileId, annotations } = this.props;
    const annotation = annotations.find(a => a.line === lineNumber);

    return (
      <Overlay
        show={expanded[lineNumber - 1]}
        onHide={() => this.setCommentState(lineNumber, false)}
        placement="bottom"
        target={() => findDOMNode(this[`comment-${lineNumber}`])}
      >
        <OverlayTooltip>
          <Annotations answerId={answerId} fileId={fileId} lineNumber={lineNumber} annotation={annotation} />
        </OverlayTooltip>
      </Overlay>
    );
  }

  renderLineNumberColumn(lineNumber) {
    return (
      <div style={styles.readOnlyEditorLineNumber}>
        <div>
          {this.renderCommentIcon(lineNumber)}
          {this.renderComments(lineNumber)}
        </div>
        {lineNumber}
        <AddCommentIcon onClick={() => this.setCommentState(lineNumber, true)} />
      </div>
    );
  }

  renderWideEditor() {
    /* eslint-disable react/no-array-index-key */
    const { content } = this.props;
    return (
      <div style={styles.readOnlyEditor}>
        {content.map((line, index) => {
          const lineNumber = index + 1;
          return (
            <div key={`${index}-${line}`} style={styles.readOnlyEditorLine}>
              <div style={{ width: '50%' }}><WideComments /></div>
              {lineNumber}
              <div style={styles.readOnlyEditorLineContent}>{line}</div>
            </div>
          );
        })}
      </div>
    );
    /* eslint-enable react/no-array-index-key */
  }

  renderNarrowEditor() {
    /* eslint-disable react/no-array-index-key */
    const { content } = this.props;
    return (
      <table style={styles.readOnlyEditor}>
        <tbody>
          <tr>
            <td style={{ width: 75 }}>
              {content.map((line, index) =>
                <div key={`${index}-${line}`}>
                  {this.renderLineNumberColumn(index + 1)}
                </div>
              )}
            </td>
            <td>
              {content.map((line, index) => {
                if (line.trim().length === 0) {
                  return <div key={`${index}-break`}><br /></div>;
                }
                return <div key={`${index}-${line}`} style={styles.readOnlyEditorLineContent}>{line}</div>;
              })}
            </td>
          </tr>
        </tbody>
      </table>
    );
    /* eslint-enable react/no-array-index-key */
  }

  renderEditor() {
    const { editorMode } = this.state;
    if (editorMode === EDITOR_MODE_NARROW) {
      return this.renderNarrowEditor();
    }
    return this.renderWideEditor();
  }

  render() {
    return (
      <div>
        {this.renderExpandAllCheckbox()}
        {this.renderEditor()}
      </div>
    );
  }
}
