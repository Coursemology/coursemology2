import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import Toggle from 'material-ui/Toggle';
import NarrowEditor from './NarrowEditor';
import WideEditor from './WideEditor';
import { annotationShape } from '../../propTypes';
import translations from '../../translations';

const EDITOR_MODE_NARROW = 'narrow';
const EDITOR_MODE_WIDE = 'wide';

class ReadOnlyEditor extends Component {
  constructor(props) {
    super(props);

    const expanded = [];
    for (let i = 0; i < props.content.length; i += 1) {
      expanded.push(false);
    }

    const initialEditorMode =
      props.annotations.length > 0 ? EDITOR_MODE_WIDE : EDITOR_MODE_NARROW;
    this.state = { expanded, editorMode: initialEditorMode };

    this.showCommentsPanel = this.showCommentsPanel.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { expanded } = this.state;

    // We only want to minimize the annotation/comment popup line that is added/deleted which can be
    // computed by getting the differences of lines before and after the operation.
    const annotationLinesPrev = prevProps.annotations.map(
      (annotation) => annotation.line,
    );
    const annotationLinesNext = this.props.annotations.map(
      (annotation) => annotation.line,
    );
    // If an annotation is deleted
    const updatedLineLeft = annotationLinesPrev.filter(
      (x) => !annotationLinesNext.includes(x),
    );
    // If an annotation is added
    const updatedLineRight = annotationLinesNext.filter(
      (x) => !annotationLinesPrev.includes(x),
    );
    const updatedLine = [...updatedLineLeft, ...updatedLineRight];

    const newExpanded = expanded.slice(0);
    newExpanded[updatedLine[0] - 1] = false;

    if (updatedLine.length > 0) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ expanded: newExpanded });
    }
  }

  setAllCommentStateExpanded() {
    const { expanded } = this.state;
    const { annotations } = this.props;

    const newExpanded = expanded.slice(0);
    newExpanded.forEach((state, index) => {
      const lineNumber = index + 1;
      const annotation = annotations.find((a) => a.line === lineNumber);
      if (!state && annotation) {
        newExpanded[index] = true;
      }
    });
    this.setState({ expanded: newExpanded });
  }

  setAllCommentStateCollapsed() {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded.forEach((_, index) => {
      newExpanded[index] = false;
    });
    this.setState({ expanded: newExpanded });
  }

  setExpandedLine(lineNumber) {
    // workaround for Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1495482
    document.getSelection().removeAllRanges();

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
      if (!expanded[i] && annotations.find((a) => a.line === i + 1)) {
        return false;
      }
    }
    return annotations.length > 0;
  }

  isIndeterminateState() {
    const { expanded } = this.state;
    const { annotations } = this.props;

    let hasExpanded = false;
    let hasCollapsed = false;
    for (let i = 0; i < expanded.length; i++) {
      if (expanded[i]) {
        hasExpanded = true;
      } else if (annotations.find((a) => a.line === i + 1)) {
        hasCollapsed = true;
      }

      if (hasExpanded && hasCollapsed) {
        return true;
      }
    }
    return false;
  }

  showCommentsPanel() {
    this.setAllCommentStateCollapsed();
    if (this.state.editorMode === EDITOR_MODE_NARROW) {
      this.setState({ editorMode: EDITOR_MODE_WIDE });
    } else {
      this.setState({ editorMode: EDITOR_MODE_NARROW });
    }
  }

  renderExpandAllToggle() {
    const { intl } = this.props;
    return (
      this.props.annotations.length > 0 && (
        <Toggle
          style={{ width: 'auto', marginLeft: 'auto' }}
          labelStyle={{ width: 'auto' }}
          label={intl.formatMessage(translations.expandComments)}
          labelPosition="left"
          toggled={this.isAllExpanded()}
          disabled={this.props.annotations.length === 0}
          onToggle={(e) => {
            if (e.target.checked) {
              this.setAllCommentStateExpanded();
            } else {
              this.setAllCommentStateCollapsed();
            }
          }}
        />
      )
    );
  }

  renderShowCommentsPanel() {
    const { intl } = this.props;
    const { editorMode } = this.state;
    return (
      <Toggle
        style={{ width: 'auto', marginLeft: 'auto' }}
        labelStyle={{ width: 'auto' }}
        label={intl.formatMessage(translations.showCommentsPanel)}
        labelPosition="left"
        toggled={editorMode === EDITOR_MODE_WIDE}
        onToggle={() => {
          this.showCommentsPanel();
        }}
      />
    );
  }

  renderEditor(editorProps) {
    const { editorMode } = this.state;

    return editorMode === EDITOR_MODE_NARROW ? (
      <NarrowEditor {...editorProps} />
    ) : (
      <WideEditor {...editorProps} />
    );
  }

  render() {
    const { expanded } = this.state;
    const { answerId, fileId, annotations, content } = this.props;
    const editorProps = {
      expanded,
      answerId,
      fileId,
      annotations,
      content,
      expandLine: (lineNumber) => this.setExpandedLine(lineNumber),
      collapseLine: (lineNumber) => this.setCollapsedLine(lineNumber),
      toggleLine: (lineNumber) => this.toggleCommentLine(lineNumber),
    };
    return (
      <>
        {this.renderShowCommentsPanel()}
        {this.renderExpandAllToggle()}
        {this.renderEditor(editorProps)}
      </>
    );
  }
}

ReadOnlyEditor.propTypes = {
  annotations: PropTypes.arrayOf(annotationShape),
  answerId: PropTypes.number.isRequired,
  content: PropTypes.arrayOf(PropTypes.string),
  fileId: PropTypes.number.isRequired,
  intl: intlShape.isRequired,
};

ReadOnlyEditor.defaultProps = {
  content: [],
};

export default injectIntl(ReadOnlyEditor);
