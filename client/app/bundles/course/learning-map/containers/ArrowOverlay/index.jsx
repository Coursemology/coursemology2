import React from 'react';
import { grey500 } from 'material-ui/styles/colors';
import GateToNodeArrows from '../GateToNodeArrows';
import NodeToGateArrows from '../NodeToGateArrows';
import { connect } from 'react-redux';
import Xarrow from 'react-xarrows';

const arrowAnchorPositions = ['left', 'right'];

const arrowProperties = {
  defaultColor: `${grey500}`,
  headSize: 4,
  selectColor: '#3297fd',
  strokeWidth: 2,
};

const ArrowOverlay = React.memo((props) => {
  const {
    cursorTrackerId,
    gateInputSizeThreshold,
    getGateId,
    getGateConnectionPointId,
    getGateInputId,
    getNodeConnectionPointId,
    nodes,
    selectedParentNodeId,
  } = props;

  const getArrowId = (parentNodeId, childNodeId) => {
    return `${parentNodeId}-to-${childNodeId}`
  };

  return (
    <>
      <NodeToGateArrows
        arrowAnchorPositions={arrowAnchorPositions}
        arrowProperties={arrowProperties}
        gateInputSizeThreshold={gateInputSizeThreshold}
        getArrowId={getArrowId}
        getGateInputId={getGateInputId}
        getNodeConnectionPointId={getNodeConnectionPointId}
      />
      <GateToNodeArrows
        arrowAnchorPositions={arrowAnchorPositions}
        arrowProperties={arrowProperties}
        getGateId={getGateId}
        getGateConnectionPointId={getGateConnectionPointId}
      />
      {
        selectedParentNodeId &&
        <Xarrow
          start={getNodeConnectionPointId(selectedParentNodeId)}
          startAnchor={arrowAnchorPositions}
          end={cursorTrackerId}
          endAnchor={arrowAnchorPositions}
          strokeWidth={2}
          color={`${grey500}`}
          divContainerStyle={{zIndex: nodes.length + 1}}
          curve={0.5}
          headSize={4}
        />
      }
    </>
  );
});

const mapStateToProps = (state) => ({
  nodes: state.learningMap.nodes,
  selectedParentNodeId: state.learningMap.selectedParentNodeId,
});

export default connect(mapStateToProps)(ArrowOverlay);
