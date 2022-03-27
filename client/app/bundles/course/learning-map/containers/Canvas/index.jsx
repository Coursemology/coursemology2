import React from 'react';
import { connect } from 'react-redux';
import { resetSelection } from 'course/learning-map/actions';
import Levels from '../Levels';
import ArrowOverlay from '../ArrowOverlay';
import CursorTracker from '../../components/CursorTracker';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Xwrapper } from 'react-xarrows';

const styles = {
  cursorPosition: {
    position: 'absolute',
  },
  wrapper: {
    outline: 'none',
    width: '100%',
  },
};

const arrowAnchorPositions = ['left', 'right'];

const Canvas = (props) => {
  const {
    dispatch,
  } = props;
  const gateInputSizeThreshold = 5;
  const cursorTrackerId = 'cursor-tracker';

  const getGateInputId = (isSummaryGate, parentNodeId, childNodeId) => {
    return isSummaryGate ? `${childNodeId}-summary-gate` : `${parentNodeId}-to-${childNodeId}-gate-input`;
  };

  const getGateId = (nodeId) => {
    return `${nodeId}-gate`;
  };

  const getGateConnectionPointId = (nodeId) => {
    return `${getGateId(nodeId)}-connection-point`;
  };

  const getNodeConnectionPointId = (nodeId) => {
    return `${nodeId}-connection-point`;
  };

  return (
    <TransformWrapper
      doubleClick={{disabled: true}}
      limitToBounds={false}
      pinch={{disabled: true}}
      minScale={0.2}
      wheel={{disabled: true}}
    >
      <TransformComponent>
        <div
          onClick={() => dispatch(resetSelection())}
          style={styles.wrapper}
          tabIndex={0}
        >
          <Xwrapper>
            <Levels
              gateInputSizeThreshold={gateInputSizeThreshold}
              getGateConnectionPointId={getGateConnectionPointId}
              getGateId={getGateId}
              getGateInputId={getGateInputId}
              getNodeConnectionPointId={getNodeConnectionPointId}
            /> 
            <CursorTracker
              arrowAnchorPositions={arrowAnchorPositions}
              id={cursorTrackerId}
              getNodeConnectionPointId={getNodeConnectionPointId}
            />
            <ArrowOverlay
              cursorTrackerId={cursorTrackerId}
              gateInputSizeThreshold={gateInputSizeThreshold}
              getGateConnectionPointId={getGateConnectionPointId}
              getGateInputId={getGateInputId}
              getNodeConnectionPointId={getNodeConnectionPointId}
            />
          </Xwrapper>
        </div>
      </TransformComponent>
    </TransformWrapper>
  );
}

export default connect()(Canvas);
