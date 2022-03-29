import React from 'react';
import { grey500 } from 'material-ui/styles/colors';
import GateToNodeArrows from '../GateToNodeArrows';
import NodeToGateArrows from '../NodeToGateArrows';
import { connect } from 'react-redux';

const arrowAnchorPositions = ['left', 'right'];

const arrowProperties = {
  defaultColor: `${grey500}`,
  headSize: 4,
  selectColor: '#3297fd',
  strokeWidth: 2,
};

const ArrowOverlay = React.memo((props) => {
  const {
    gateInputSizeThreshold,
    getGateId,
    getGateConnectionPointId,
    getGateInputId,
    getNodeConnectionPointId,
    scale,
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
        scale={scale}
      />
      <GateToNodeArrows
        arrowAnchorPositions={arrowAnchorPositions}
        arrowProperties={arrowProperties}
        getGateId={getGateId}
        getGateConnectionPointId={getGateConnectionPointId}
        scale={scale}
      />
    </>
  );
});

const mapStateToProps = (state) => ({
  nodes: state.learningMap.nodes,
  selectedElement: state.learningMap.selectedElement,
});

export default connect(mapStateToProps)(ArrowOverlay);
