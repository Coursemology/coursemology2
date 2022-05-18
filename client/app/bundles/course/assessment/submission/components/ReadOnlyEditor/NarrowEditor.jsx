import { useRef, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { grey } from '@mui/material/colors';

import AddCommentIcon from './AddCommentIcon';
import Annotations from '../../containers/Annotations';
import { annotationShape } from '../../propTypes';

const styles = {
  editor: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: grey[200],
    borderRadius: 5,
    padding: 5,
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
    annotations,
    editorWidth,
  } = props;

  const annotation = annotations.find((a) => a.line === lineNumber);

  const renderComments = () => {
    const { answerId, fileId, expanded } = props;

    if (expanded[lineNumber - 1]) {
      return (
        <div
          style={{
            width: Math.max(0, editorWidth - 2),
            maxWidth: 850,
            ...styles.tooltipStyle,
          }}
        >
          <div style={styles.tooltipInnerStyle}>
            <Annotations
              answerId={answerId}
              fileId={fileId}
              lineNumber={lineNumber}
              annotation={annotation}
              airMode={false}
            />
          </div>
        </div>
      );
    }
    return <></>;
  };

  return (
    <>
      <div
        style={
          annotation
            ? styles.editorLineNumberWithComments
            : styles.editorLineNumber
        }
        onClick={() => toggleComment(lineNumber)}
        onMouseOver={() => setLineHovered(lineNumber)}
        onMouseOut={() => setLineHovered(0)}
      >
        <div>{lineNumber}</div>
        <AddCommentIcon
          onClick={() => expandComment(lineNumber)}
          hovered={lineHovered === lineNumber}
        />
      </div>
      {renderComments(lineNumber)}
    </>
  );
};

LineNumberColumn.propTypes = {
  lineNumber: PropTypes.number.isRequired,
  lineHovered: PropTypes.number.isRequired,
  setLineHovered: PropTypes.func.isRequired,
  toggleComment: PropTypes.func.isRequired,
  expandComment: PropTypes.func.isRequired,
  editorWidth: PropTypes.number.isRequired,

  expanded: PropTypes.arrayOf(PropTypes.bool).isRequired,
  answerId: PropTypes.number.isRequired,
  fileId: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(annotationShape),
};

export default function NarrowEditor(props) {
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

  const renderLineNumberColumn = (lineNumber) => (
    <LineNumberColumn
      lineNumber={lineNumber}
      lineHovered={lineHovered}
      setLineHovered={setLineHovered}
      toggleComment={toggleComment}
      expandComment={expandComment}
      editorWidth={editorWidth}
      {...props}
    />
  );

  const { content } = props;

  return (
    <table className="codehilite" style={styles.editor} ref={editorRef}>
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
                overflowX: 'visible',
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
  );
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
