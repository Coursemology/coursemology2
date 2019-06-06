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
  static propTypes = {
    annotations: PropTypes.arrayOf(annotationShape),
    answerId: PropTypes.number.isRequired,
    content: PropTypes.arrayOf(PropTypes.string),
    fileId: PropTypes.number.isRequired,
    intl: intlShape.isRequired,
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

    const initialEditorMode = props.annotations.length > 0 ? EDITOR_MODE_WIDE : EDITOR_MODE_NARROW;
    this.state = { expanded, editorMode: initialEditorMode };

    this.showCommentsPanel = this.showCommentsPanel.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const expanded = [];
    for (let i = 0; i < nextProps.content.length; i += 1) {
      expanded.push(false);
    }

    this.setState({ expanded });
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
      if (!expanded[i] && annotations.find(a => a.line === i + 1)) {
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
      } else if (annotations.find(a => a.line === i + 1)) {
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
      this.props.annotations.length > 0
      && (
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

    return (
      editorMode === EDITOR_MODE_NARROW
        ? <NarrowEditor {...editorProps} />
        : <WideEditor {...editorProps} />
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
      expandLine: lineNumber => this.setExpandedLine(lineNumber),
      collapseLine: lineNumber => this.setCollapsedLine(lineNumber),
      toggleLine: lineNumber => this.toggleCommentLine(lineNumber),
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

export default injectIntl(ReadOnlyEditor);
