import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Overlay } from 'react-overlays';
import { grey200, grey400 } from 'material-ui/styles/colors';

import AddCommentIcon from './AddCommentIcon';
import OverlayTooltip from './OverlayTooltip';
import Annotations from '../../containers/Annotations';
import { annotationShape } from '../../propTypes';

const styles = {
  editor: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: grey200,
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
    borderRightColor: grey200,
    padding: '0 5px',
  },
  editorLineNumberWithComments: {
    height: 20,
    alignItems: 'center',
    backgroundColor: grey400,
    display: 'flex',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: grey200,
    padding: '0 5px',
  },
};

const LineNumberColumn = (props) => {
  const triggerRef = useRef(null);
  const containerRef = useRef(null);

  const {
    lineNumber,
    lineHovered,
    setLineHovered,
    toggleComment,
    expandComment,
    annotations,
  } = props;

  const annotation = annotations.find((a) => a.line === lineNumber);

  const renderComments = () => {
    const {
      answerId,
      fileId,
      expanded,
      collapseLine,
      activeComment,
      setActiveComment,
    } = props;

    return (
      <Overlay
        show={expanded[lineNumber - 1]}
        onHide={() => collapseLine(lineNumber)}
        placement="right"
        rootClose
        target={triggerRef}
        container={containerRef}
      >
        {({ props: props2, placement }) => (
          <OverlayTooltip
            placement={placement}
            style={{ zIndex: activeComment === lineNumber ? 1000 : lineNumber }}
            {...props2}
          >
            <div onClick={() => setActiveComment(lineNumber)}>
              <Annotations
                answerId={answerId}
                fileId={fileId}
                lineNumber={lineNumber}
                annotation={annotation}
                airMode={false}
              />
            </div>
          </OverlayTooltip>
        )}
      </Overlay>
    );
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
        ref={containerRef}
      >
        <div>{lineNumber}</div>
        <AddCommentIcon
          onClick={() => expandComment(lineNumber)}
          hovered={lineHovered === lineNumber}
          ref={triggerRef}
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
  setActiveComment: PropTypes.func.isRequired,
  toggleComment: PropTypes.func.isRequired,
  expandComment: PropTypes.func.isRequired,
  activeComment: PropTypes.number.isRequired,

  expanded: PropTypes.arrayOf(PropTypes.bool).isRequired,
  answerId: PropTypes.number.isRequired,
  fileId: PropTypes.number.isRequired,
  annotations: PropTypes.arrayOf(annotationShape),
  content: PropTypes.arrayOf(PropTypes.string).isRequired,
  expandLine: PropTypes.func,
  collapseLine: PropTypes.func,
  toggleLine: PropTypes.func,
};

export default function NarrowEditor(props) {
  const [activeComment, setActiveComment] = useState(0);
  const [lineHovered, setLineHovered] = useState(0);

  const expandComment = (lineNumber) => {
    props.expandLine(lineNumber);
    setActiveComment(lineNumber);
  };

  const toggleComment = (lineNumber) => {
    props.toggleLine(lineNumber);
    setActiveComment(lineNumber);
  };

  const renderLineNumberColumn = (lineNumber) => (
    <LineNumberColumn
      lineNumber={lineNumber}
      lineHovered={lineHovered}
      setLineHovered={setLineHovered}
      setActiveComment={setActiveComment}
      toggleComment={toggleComment}
      expandComment={expandComment}
      activeComment={activeComment}
      {...props}
    />
  );

  const { content } = props;

  /* eslint-disable react/no-array-index-key */
  return (
    <table className="codehilite" style={styles.editor}>
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
                {renderLineNumberColumn(index + 1)}
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
  );
  /* eslint-enable react/no-array-index-key */
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
