import { Component } from 'react';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import { annotationShape } from '../../propTypes';

import AddCommentIcon from './AddCommentIcon';
import WideComments from './WideComments';

const styles = {
  layout: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  editorContainer: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: grey[200],
    borderRadius: 5,
    overflow: 'auto',
  },
  editor: {
    width: '100%',
    overflow: 'hidden',
    tableLayout: 'fixed',
  },
  editorLine: {
    height: 20,
    alignItems: 'center',
    display: 'flex',
    paddingLeft: 5,
    whiteSpace: 'nowrap',
  },
  editorLineNumber: {
    height: 20,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: grey[200],
    padding: '0 5px',
  },
  editorLineNumberWithComments: {
    height: 20,
    alignItems: 'center',
    backgroundColor: grey[400],
    display: 'flex',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: grey[200],
    padding: '0 5px',
  },
};

export default class WideEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeComment: 0,
      lineHovered: 0,
    };
  }

  expandComment(lineNumber) {
    this.props.expandLine(lineNumber);
    this.setState({ activeComment: lineNumber });
  }

  toggleComment(lineNumber) {
    this.props.toggleLine(lineNumber);
    this.setState({ activeComment: lineNumber });
  }

  renderComments() {
    const { activeComment } = this.state;
    const { answerId, fileId, expanded, annotations, collapseLine } =
      this.props;
    return (
      <WideComments
        activeComment={activeComment}
        annotations={annotations}
        answerId={answerId}
        collapseLine={(lineNumber) => collapseLine(lineNumber)}
        expanded={expanded}
        expandLine={(lineNumber) => this.expandComment(lineNumber)}
        fileId={fileId}
        onClick={(lineNumber) => this.setState({ activeComment: lineNumber })}
      />
    );
  }

  renderEditor() {
    /* eslint-disable react/no-array-index-key */
    const { content } = this.props;
    return (
      <div style={styles.editorContainer}>
        <table cellSpacing={0} className="codehilite" style={styles.editor}>
          <tbody>
            <tr>
              <td
                style={{
                  width: 50,
                  userSelect: 'none',
                  paddingBottom: 20,
                  verticalAlign: 'top',
                }}
              >
                {content.map((line, index) => (
                  <div key={`${index}-${line}`}>
                    {this.renderLineNumberColumn(index + 1)}
                  </div>
                ))}
              </td>
              <td
                style={{
                  display: 'block',
                  overflowX: 'scroll',
                  verticalAlign: 'top',
                }}
              >
                <div style={{ display: 'inline-block' }}>
                  {content.map((line, index) => (
                    <div key={`${index}-${line}`} style={styles.editorLine}>
                      <pre style={{ overflow: 'visible' }}>
                        <code
                          dangerouslySetInnerHTML={{ __html: line }}
                          style={{ whiteSpace: 'inherit' }}
                        />
                      </pre>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
    /* eslint-enable react/no-array-index-key */
  }

  renderLineNumberColumn(lineNumber) {
    const { lineHovered } = this.state;
    const { annotations, isUpdatingAnnotationAllowed } = this.props;
    const annotation = annotations.find((a) => a.line === lineNumber);

    return (
      <div
        onClick={() => this.toggleComment(lineNumber)}
        onMouseOut={() => this.setState({ lineHovered: -1 })}
        onMouseOver={() => this.setState({ lineHovered: lineNumber })}
        style={
          annotation
            ? styles.editorLineNumberWithComments
            : styles.editorLineNumber
        }
      >
        {lineNumber}
        {isUpdatingAnnotationAllowed && (
          <AddCommentIcon
            hovered={lineHovered === lineNumber}
            onClick={() => this.expandComment(lineNumber)}
          />
        )}
      </div>
    );
  }

  render() {
    return (
      <table>
        <tbody>
          <tr>
            <td style={{ maxWidth: 200 }}>{this.renderComments()}</td>
            <td style={{ width: '60%' }}>{this.renderEditor()}</td>
          </tr>
        </tbody>
      </table>
    );
  }
}

WideEditor.propTypes = {
  expanded: PropTypes.arrayOf(PropTypes.bool).isRequired,
  answerId: PropTypes.number.isRequired,
  fileId: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(annotationShape),
  content: PropTypes.arrayOf(PropTypes.string).isRequired,
  expandLine: PropTypes.func,
  collapseLine: PropTypes.func,
  toggleLine: PropTypes.func,
  isUpdatingAnnotationAllowed: PropTypes.bool.isRequired,
};

WideEditor.defaultProps = {
  expandLine: () => {},
  collapseLine: () => {},
  toggleLine: () => {},
};
