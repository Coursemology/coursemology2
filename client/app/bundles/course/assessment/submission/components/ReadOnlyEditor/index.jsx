import React, { Component } from 'react';
import PropTypes from 'prop-types';

import NarrowEditor from './NarrowEditor';
import WideEditor from './WideEditor';
import { AnnotationProp } from '../../propTypes';

const EDITOR_THRESHOLD = 1063;
const EDITOR_MODE_NARROW = 'narrow';
const EDITOR_MODE_WIDE = 'wide';

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

  // setAllCommentStateExpanded() {
  //   const { expanded } = this.state;
  //   const { annotations } = this.props;

  //   const newExpanded = expanded.slice(0);
  //   newExpanded.forEach((state, index) => {
  //     const lineNumber = index + 1;
  //     const annotation = annotations.find(a => a.line === lineNumber);
  //     if (!state && annotation) {
  //       newExpanded[index] = true;
  //     }
  //   });
  //   this.setState({ expanded: newExpanded });
  // }

  // setAllCommentStateCollapsed() {
  //   const { expanded } = this.state;
  //   const newExpanded = expanded.slice(0);
  //   newExpanded.forEach((_, index) => { newExpanded[index] = false; });
  //   this.setState({ expanded: newExpanded });
  // }

  setExpandedLine(lineNumber) {
    const { expanded } = this.state;
    const newExpanded = [];
    for (let i = 0; i < expanded.length; i += 1) {
      if (i !== lineNumber - 1) {
        newExpanded.push(false);
      } else {
        newExpanded.push(true);
      }
    }
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
    if (expanded[lineNumber - 1]) {
      const newExpanded = expanded.slice(0);
      newExpanded[lineNumber - 1] = false;
      this.setState({ expanded: newExpanded });
    } else {
      this.setExpandedLine(lineNumber);
    }
  }

  windowResizing(e) {
    if (e.currentTarget.innerWidth < EDITOR_THRESHOLD) {
      this.setState({ editorMode: EDITOR_MODE_NARROW });
    } else {
      this.setState({ editorMode: EDITOR_MODE_WIDE });
    }
  }

  /* renderExpandAllCheckbox() {
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
  } */

  render() {
    const { expanded, editorMode } = this.state;
    const { answerId, fileId, annotations, content } = this.props;
    if (editorMode === EDITOR_MODE_NARROW) {
      return (
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
      );
    }
    return (
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
    );
  }
}
