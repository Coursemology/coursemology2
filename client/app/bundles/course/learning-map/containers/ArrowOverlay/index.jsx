import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import GateToNodeArrows from '../GateToNodeArrows';
import NodeToGateArrows from '../NodeToGateArrows';

const arrowAnchorPositions = ['left', 'right'];

const arrowProperties = {
  defaultColor: '#808080',
  headSize: 4,
  selectColor: '#3297fd',
  strokeWidth: 2,
};

const ArrowOverlay = (props) => {
  const {
    gateInputSizeThreshold,
    getGateId,
    getGateConnectionPointId,
    getGateInputId,
    getNodeConnectionPointId,
    scale,
  } = props;

  const getArrowId = (parentNodeId, childNodeId) =>
    `${parentNodeId}-to-${childNodeId}`;

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
};

const mapStateToProps = (state) => ({
  nodes: state.learningMap.nodes,
  selectedElement: state.learningMap.selectedElement,
});

ArrowOverlay.propTypes = {
  gateInputSizeThreshold: PropTypes.number.isRequired,
  getGateId: PropTypes.func.isRequired,
  getGateConnectionPointId: PropTypes.func.isRequired,
  getGateInputId: PropTypes.func.isRequired,
  getNodeConnectionPointId: PropTypes.func.isRequired,
  scale: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(React.memo(ArrowOverlay));
