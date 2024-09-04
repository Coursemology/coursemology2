import { useCallback, useEffect, useRef, useState } from 'react';
import { ClickAwayListener } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import Annotations from '../../containers/Annotations';
import { annotationShape } from '../../propTypes';

import AddCommentIcon from './AddCommentIcon';

const styles = {
  editorContainer: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: grey[200],
    borderRadius: 5,
    overflow: 'auto',
  },
  editor: {
    width: '100%',
    tableLayout: 'fixed',
  },
  editorLine: {
    height: 20,
    alignItems: 'center',
    display: 'flex',
    paddingLeft: 5,
    whiteSpace: 'nowrap',
    overflow: 'visible',
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
    position: 'relative',
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
    position: 'relative',
  },
  tooltipStyle: {
    position: 'relative',
    top: 0,
    left: 0,
  },
  tooltipInnerStyle: {
    color: '#000',
    textAlign: 'center',
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
};

const LineNumberColumn = (props) => {
  const {
    lineNumber,
    lineHovered,
    setLineHovered,
    toggleComment,
    expandComment,
    collapseComment,
    annotations,
    editorWidth,
    isUpdatingAnnotationAllowed,
  } = props;

  const annotation = annotations.find((a) => a.line === lineNumber);

  const renderComments = () => {
    const { answerId, fileId, expanded } = props;

    if (expanded[lineNumber - 1]) {
      return (
        <ClickAwayListener
          onClickAway={(event) => collapseComment(lineNumber, event)}
        >
          <div
            style={{
              width: Math.max(0, editorWidth - 2),
              maxWidth: 1000,
              ...styles.tooltipStyle,
            }}
          >
            <div style={styles.tooltipInnerStyle}>
              <Annotations
                annotation={annotation}
                answerId={answerId}
                fileId={fileId}
                isUpdatingAnnotationAllowed={isUpdatingAnnotationAllowed}
                lineNumber={lineNumber}
              />
            </div>
          </div>
        </ClickAwayListener>
      );
    }
    return null;
  };

  return (
    <>
      <div
        onClick={() => {
          if (annotation || isUpdatingAnnotationAllowed) {
            toggleComment(lineNumber);
          }
        }}
        onMouseOut={() => setLineHovered(0)}
        onMouseOver={() => setLineHovered(lineNumber)}
        style={
          annotation
            ? styles.editorLineNumberWithComments
            : styles.editorLineNumber
        }
      >
        <div>{lineNumber}</div>
        {(annotation || isUpdatingAnnotationAllowed) && (
          <AddCommentIcon
            hovered={lineHovered === lineNumber}
            onClick={() => expandComment(lineNumber)}
          />
        )}
      </div>

      {renderComments()}
    </>
  );
};

LineNumberColumn.propTypes = {
  lineNumber: PropTypes.number.isRequired,
  lineHovered: PropTypes.number.isRequired,
  setLineHovered: PropTypes.func.isRequired,
  toggleComment: PropTypes.func.isRequired,
  expandComment: PropTypes.func.isRequired,
  collapseComment: PropTypes.func.isRequired,
  editorWidth: PropTypes.number.isRequired,

  expanded: PropTypes.arrayOf(PropTypes.bool).isRequired,
  answerId: PropTypes.number.isRequired,
  fileId: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(annotationShape),
  isUpdatingAnnotationAllowed: PropTypes.bool.isRequired,
};

const NarrowEditor = (props) => {
  const editorRef = useRef();
  const [editorWidth, setEditorWidth] = useState(0);
  const [lineHovered, setLineHovered] = useState(0);

  const getEditorWidth = useCallback(() => {
    if (!editorRef || !editorRef.current) {
      return;
    }
    setEditorWidth(editorRef.current.clientWidth - 50); // 50 is the width of the line number column
  }, [editorRef]);

  useEffect(() => {
    getEditorWidth();
  }, [getEditorWidth]);

  useEffect(() => {
    window.addEventListener('resize', getEditorWidth);

    return () => window.removeEventListener('resize', getEditorWidth);
  }, [getEditorWidth]);

  const expandComment = (lineNumber) => {
    props.expandLine(lineNumber);
  };

  const toggleComment = (lineNumber) => {
    props.toggleLine(lineNumber);
  };

  const collapseComment = (lineNumber, event) => {
    // CKEditor's Link popup dialog is rendered separately in a separate wrapper (ck-body-wrapper)
    // and not rendered as a child of the main CKEditor's toolbar.
    // As a result, the clickawaylistener would be triggered when the Link popup dialog is clicked.
    // Here, we check the class' of the clicked element and if contains "ck", the comment is not collapsed.
    // There is a downside to this that lets say if another ckeditor toolbar is clicked, the comment is also
    // not collapsed, however, this is not a big issue as the former issue would be more disruptive for users.
    if (!event.target.classList.contains('ck')) props.collapseLine(lineNumber);
  };

  const renderLineNumberColumn = (lineNumber) => (
    <LineNumberColumn
      collapseComment={collapseComment}
      editorWidth={editorWidth}
      expandComment={expandComment}
      isUpdatingAnnotationAllowed={props.isUpdatingAnnotationAllowed}
      lineHovered={lineHovered}
      lineNumber={lineNumber}
      setLineHovered={setLineHovered}
      toggleComment={toggleComment}
      {...props}
    />
  );

  const { content } = props;

  return (
    <div style={styles.editorContainer}>
      <table
        ref={editorRef}
        cellSpacing={0}
        className="codehilite"
        style={styles.editor}
      >
        <tbody>
          {content.map((line, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={`${index}-${line}`}>
              <td
                style={{
                  width: 50,
                  userSelect: 'none',
                  verticalAlign: 'top',
                }}
              >
                {renderLineNumberColumn(index + 1)}
              </td>

              <td
                style={{
                  display: 'block',
                  verticalAlign: 'top',
                }}
              >
                <div style={styles.editorLine}>
                  <pre style={{ overflow: 'visible' }}>
                    <code
                      dangerouslySetInnerHTML={{ __html: line }}
                      style={{ whiteSpace: 'inherit' }}
                    />
                  </pre>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

NarrowEditor.propTypes = {
  expanded: PropTypes.arrayOf(PropTypes.bool).isRequired,
  answerId: PropTypes.number.isRequired,
  fileId: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(annotationShape),
  isUpdatingAnnotationAllowed: PropTypes.bool.isRequired,
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

export default NarrowEditor;
