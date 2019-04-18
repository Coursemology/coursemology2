import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import NarrowEditor from './NarrowEditor';
import WideEditor from './WideEditor';
import Checkbox from './Checkbox';
import { annotationShape } from '../../propTypes';
import translations from '../../translations';

const EDITOR_THRESHOLD = 1063;
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

    const initialEditorMode = window.innerWidth < EDITOR_THRESHOLD ? EDITOR_MODE_NARROW : EDITOR_MODE_WIDE;
    this.state = { expanded, editorMode: initialEditorMode };

    this.windowResizing = this.windowResizing.bind(this);
    this.hideCommentsPanel = this.hideCommentsPanel.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.windowResizing);
  }

  componentWillReceiveProps(nextProps) {
    const expanded = [];
    for (let i = 0; i < nextProps.content.length; i += 1) {
      expanded.push(false);
    }

    this.setState({ expanded });
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

  windowResizing(e) {
    this.setAllCommentStateCollapsed();
    if (e.currentTarget.innerWidth < EDITOR_THRESHOLD) {
      this.setState({ editorMode: EDITOR_MODE_NARROW });
    } else {
      this.setState({ editorMode: EDITOR_MODE_WIDE });
    }
  }

  hideCommentsPanel() {
    this.setAllCommentStateCollapsed();
    if (this.state.editorMode === EDITOR_MODE_NARROW) {
      this.setState({ editorMode: EDITOR_MODE_WIDE });
    } else {
      this.setState({ editorMode: EDITOR_MODE_NARROW });
    }
  }

  renderExpandAllCheckbox() {
    const { intl } = this.props;
    return (
      this.props.annotations.length > 0
      && (
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
            disabled={this.props.annotations.length === 0}
            indeterminate={this.isIndeterminateState()}
          />
          <span>{intl.formatMessage(translations.expandComments)}</span>
        </div>
      )
    );
  }

  renderHideCommentsPanel() {
    const { intl } = this.props;
    const { editorMode } = this.state;
    return (
      window.innerWidth > EDITOR_THRESHOLD
      && (
        <div style={{ display: 'flex', marginBottom: 5 }}>
          <Checkbox
            style={{ marginRight: 5 }}
            onChange={() => {
              this.hideCommentsPanel();
            }}
            disabled={false}
            checked={editorMode === EDITOR_MODE_NARROW}
          />
          <span>{intl.formatMessage(translations.hideCommentsPanel)}</span>
        </div>
      )
    );
  }

  render() {
    const { expanded, editorMode } = this.state;
    const { answerId, fileId, annotations, content } = this.props;
    if (editorMode === EDITOR_MODE_NARROW) {
      return (
        <>
          {this.renderHideCommentsPanel()}
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
        </>
      );
    }
    return (
      <>
        {this.renderHideCommentsPanel()}
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
      </>
    );
  }
}

export default injectIntl(ReadOnlyEditor);
