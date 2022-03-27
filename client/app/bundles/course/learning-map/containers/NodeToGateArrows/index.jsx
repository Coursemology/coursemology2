import React from 'react';
import { connect } from 'react-redux';
import { selectArrow } from 'course/learning-map/actions';
import Xarrow from 'react-xarrows';

const NodeToGateArrows = (props) => {
  const {
    arrowAnchorPositions,
    arrowProperties,
    canModify,
    dispatch,
    gateInputSizeThreshold,
    getArrowId,
    getGateInputId,
    getNodeConnectionPointId,
    nodes,
    selectedArrowId,
  } = props;

  const onArrowClick = (event, arrowId) => {
    if (canModify) {
      event.stopPropagation();
      dispatch(selectArrow(arrowId));
    }
  };

  const nodeIdsToIsSummaryGate = nodes.reduce((nodeIdsToIsSummaryGate, node) =>
    ({...nodeIdsToIsSummaryGate, [node.id]: node.parents.length > gateInputSizeThreshold}), {}
  );

  return (
    <>
      {
        nodes.map(node => {
          return (
            node.children.map(child => {
              const arrowId = getArrowId(node.id, child.id);

              return (
                <Xarrow
                  key={arrowId}
                  start={getNodeConnectionPointId(node.id)}
                  startAnchor={arrowAnchorPositions}
                  end={getGateInputId(nodeIdsToIsSummaryGate[child.id], node.id, child.id)}
                  endAnchor={arrowAnchorPositions}
                  color={selectedArrowId === arrowId ? arrowProperties.selectColor : arrowProperties.defaultColor}
                  dashness={!canModify && !child.is_satisfied}
                  divContainerProps={{id: arrowId}}
                  divContainerStyle={{position: 'relative', cursor: canModify && 'pointer', zIndex: node.depth + 2}}
                  headSize={arrowProperties.headSize}
                  passProps={{onClick: (event) => onArrowClick(event, arrowId)}}
                  strokeWidth={arrowProperties.strokeWidth}
                />
              );
            })
          );
        })
      }
    </>
  );
};

const mapStateToProps = (state) => ({
  canModify: state.learningMap.canModify,
  nodes: state.learningMap.nodes,
  selectedArrowId: state.learningMap.selectedArrowId,
});

export default connect(mapStateToProps)(NodeToGateArrows);

