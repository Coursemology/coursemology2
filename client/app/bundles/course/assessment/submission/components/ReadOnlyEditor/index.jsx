import React, { Component } from 'react';
import PropTypes from 'prop-types';

import NarrowEditor from './NarrowEditor';
import WideEditor from './WideEditor';
import Checkbox from './Checkbox';
import { annotationShape } from '../../propTypes';

const EDITOR_THRESHOLD = 1063;
const EDITOR_MODE_NARROW = 'narrow';
const EDITOR_MODE_WIDE = 'wide';

export default class ReadOnlyEditor extends Component {
  static propTypes = {
    annotations: PropTypes.arrayOf(annotationShape),
    answerId: PropTypes.number.isRequired,
    content: PropTypes.arrayOf(PropTypes.string),
    fileId: PropTypes.number.isRequired,
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

    this.windowResizing = this.windowResizing.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.windowResizing);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.windowResizing);
  }

  setAllCommentStateExpanded() {
    const { expanded } = this.state;
    const { annotations } = this.props;

    const newExpanded = expanded.slice(0);
    newExpanded.forEach((state, index) => {
      const lineNumber = index + 1;
      const annotation = annotations.find(a => a.line === lineNumber);
      if (!state && annotation) {
        newExpanded[index] = true;
      }
    });
    this.setState({ expanded: newExpanded });
  }

  setAllCommentStateCollapsed() {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded.forEach((_, index) => { newExpanded[index] = false; });
    this.setState({ expanded: newExpanded });
  }

  setExpandedLine(lineNumber) {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded[lineNumber - 1] = true;
    this.setState({ expanded: newExpanded });
  }

  setCollapsedLine(lineNumber) {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded[lineNumber - 1] = false;
    this.setState({ expanded: newExpanded });
  }

  toggleCommentLine(lineNumber) {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded[lineNumber - 1] = !newExpanded[lineNumber - 1];
    this.setState({ expanded: newExpanded });
  }

  isAllExpanded() {
    const { expanded } = this.state;
    const { annotations } = this.props;
    for (let i = 0; i < expanded.length; i++) {
      if (!expanded[i] && annotations.find(a => a.line === i + 1)) {
        return false;
      }
    }
    return true;
  }

  isIndeterminateState() {
    const { expanded } = this.state;
    const { annotations } = this.props;

    let hasExpanded = false;
    let hasCollapsed = false;
    for (let i = 0; i < expanded.length; i++) {
      if (expanded[i]) {
        hasExpanded = true;
      } else if (annotations.find(a => a.line === i + 1)) {
        hasCollapsed = true;
      }

      if (hasExpanded && hasCollapsed) {
        return true;
      }
    }
    return false;
  }

  windowResizing(e) {
    this.setAllCommentStateCollapsed();
    if (e.currentTarget.innerWidth < EDITOR_THRESHOLD) {
      this.setState({ editorMode: EDITOR_MODE_NARROW });
    } else {
      this.setState({ editorMode: EDITOR_MODE_WIDE });
    }
  }

  renderExpandAllCheckbox() {
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
          checked={this.isAllExpanded()}
          indeterminate={this.isIndeterminateState()}
        />
        Expand all comments
      </div>
    );
  }

  render() {
    const { expanded, editorMode } = this.state;
    const { answerId, fileId, annotations, content } = this.props;
    if (editorMode === EDITOR_MODE_NARROW) {
      return (
        <div>
          <NarrowEditor
            expanded={expanded}
            answerId={answerId}
            fileId={fileId}
            annotations={annotations}
            content={content}
            expandLine={lineNumber => this.setExpandedLine(lineNumber)}
            collapseLine={lineNumber => this.setCollapsedLine(lineNumber)}
            toggleLine={lineNumber => this.toggleCommentLine(lineNumber)}
          />
        </div>
      );
    }
    return (
      <div>
        {this.renderExpandAllCheckbox()}
        <WideEditor
          expanded={expanded}
          answerId={answerId}
          fileId={fileId}
          annotations={annotations}
          content={content}
          expandLine={lineNumber => this.setExpandedLine(lineNumber)}
          collapseLine={lineNumber => this.setCollapsedLine(lineNumber)}
          toggleLine={lineNumber => this.toggleCommentLine(lineNumber)}
        />
      </div>
    );
  }
}
