import React from 'react';
import { connect } from 'react-redux';
import { resetSelection } from 'course/learning-map/actions';
import Levels from '../Levels';
import { Xwrapper } from 'react-xarrows';
import ArrowOverlay from '../ArrowOverlay';
import CursorTracker from '../../components/CursorTracker';

const styles = {
  cursorPosition: {
    position: 'absolute',
  },
  wrapper: {
    outline: 'none',
    overflow: 'auto',
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
    <Xwrapper>
      <div
        onClick={() => dispatch(resetSelection())}
        style={styles.wrapper}
        tabIndex={0}
      >
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
      </div>
    </Xwrapper>
  );
}

export default connect()(Canvas);
