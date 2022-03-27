import React, { useRef, useState } from 'react';
import { useXarrow } from 'react-xarrows';
import { connect } from 'react-redux';
import { elementTypes } from '../../constants';

const styles = {
  tracker: {
    position: 'relative',
  },
  wrapper: {
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
};

/* Dummy div for arrow to follow cursor position when trying to create a new condition */
const CursorTracker = (props) => {
  const {
    id,
    nodes,
    selectedElement,
  } = props;
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const updateXarrow = useXarrow();

  const updateCursorPosition = (event) => {
    const {
      offsetLeft,
      offsetTop
    } = ref.current;
    const boundingRectangle = ref.current.getBoundingClientRect();

    setCursorPosition({
      x: event.clientX - boundingRectangle.x + offsetLeft,
      y: event.clientY - boundingRectangle.y + offsetTop,
    });

    updateXarrow();
  };

  return (
    <div
      onMouseMove={(event) => updateCursorPosition(event)}
      ref={ref}
      style={{
        ...styles.wrapper,
        zIndex: selectedElement.type === elementTypes.parentNode ? nodes.length + 1 : 1,
      }}
    >
      <div
        id={id}
        style={{
          ...styles.tracker,
          left: cursorPosition.x,
          top: cursorPosition.y,
        }}
      >
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  nodes: state.learningMap.nodes,
  selectedElement: state.learningMap.selectedElement,
});

export default connect(mapStateToProps)(CursorTracker);
