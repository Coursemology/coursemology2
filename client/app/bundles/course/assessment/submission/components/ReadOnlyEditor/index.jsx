import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import { FormControlLabel, Switch } from '@material-ui/core';
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
    const deletedAnnotationLine = annotationLinesPrev.filter(
      (x) => !annotationLinesNext.includes(x),
    );
    // If an annotation is added
    const addedAnnotationLine = annotationLinesNext.filter(
      (x) => !annotationLinesPrev.includes(x),
    );
    const updatedLine = [...deletedAnnotationLine, ...addedAnnotationLine];

    if (updatedLine.length > 0) {
      const newExpanded = expanded.slice(0);
      newExpanded[updatedLine[0] - 1] = false;
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ expanded: newExpanded });
    }
  }

  setAllCommentStateCollapsed() {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded.forEach((_, index) => {
      newExpanded[index] = false;
    });
    this.setState({ expanded: newExpanded });
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

  setCollapsedLine(lineNumber) {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded[lineNumber - 1] = false;
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

  showCommentsPanel = () => {
    this.setAllCommentStateCollapsed();
    if (this.state.editorMode === EDITOR_MODE_NARROW) {
      this.setState({ editorMode: EDITOR_MODE_WIDE });
    } else {
      this.setState({ editorMode: EDITOR_MODE_NARROW });
    }
  };

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

  toggleCommentLine(lineNumber) {
    const { expanded } = this.state;
    const newExpanded = expanded.slice(0);
    newExpanded[lineNumber - 1] = !newExpanded[lineNumber - 1];
    this.setState({ expanded: newExpanded });
  }

  renderEditor(editorProps) {
    const { editorMode } = this.state;

    return editorMode === EDITOR_MODE_NARROW ? (
      <NarrowEditor {...editorProps} />
    ) : (
      <WideEditor {...editorProps} />
    );
  }

  renderExpandAllToggle() {
    const { intl } = this.props;
    return (
      this.props.annotations.length > 0 && (
        <FormControlLabel
          control={
            <Switch
              checked={this.isAllExpanded()}
              color="primary"
              onChange={(e) => {
                if (e.target.checked) {
                  this.setAllCommentStateExpanded();
                } else {
                  this.setAllCommentStateCollapsed();
                }
              }}
            />
          }
          disabled={this.props.annotations.length === 0}
          label={<b>{intl.formatMessage(translations.expandComments)}</b>}
          labelPlacement="start"
        />
      )
    );
  }

  renderShowCommentsPanel() {
    const { intl } = this.props;
    const { editorMode } = this.state;
    return (
      <FormControlLabel
        control={
          <Switch
            checked={editorMode === EDITOR_MODE_WIDE}
            color="primary"
            onChange={() => {
              this.showCommentsPanel();
            }}
          />
        }
        disabled={this.props.annotations.length === 0}
        label={<b>{intl.formatMessage(translations.showCommentsPanel)}</b>}
        labelPlacement="start"
      />
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
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {this.renderShowCommentsPanel()}
          {this.renderExpandAllToggle()}
        </div>
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
