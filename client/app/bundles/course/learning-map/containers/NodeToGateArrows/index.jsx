import { connect } from 'react-redux';
import Xarrow from 'react-xarrows';
import PropTypes from 'prop-types';

import { selectArrow } from 'course/learning-map/operations';

import { elementTypes } from '../../constants';
import {
  arrowPropertiesShape,
  nodeShape,
  selectedElementShape,
} from '../../propTypes';

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
    selectedElement,
    scale,
  } = props;

  const onArrowClick = (event, arrowId) => {
    if (canModify) {
      event.stopPropagation();
      dispatch(selectArrow(arrowId));
    }
  };

  const nodeIdsToIsSummaryGate = nodes.reduce(
    (previousMap, node) => ({
      ...previousMap,
      [node.id]: node.parents.length > gateInputSizeThreshold,
    }),
    {},
  );

  return (
    <>
      {nodes.map((node) =>
        node.children.map((child) => {
          const arrowId = getArrowId(node.id, child.id);

          return (
            <Xarrow
              key={arrowId}
              color={
                selectedElement.type === elementTypes.arrow &&
                selectedElement.id === arrowId
                  ? arrowProperties.selectColor
                  : arrowProperties.defaultColor
              }
              dashness={!canModify && !child.isSatisfied}
              divContainerProps={{ id: arrowId }}
              divContainerStyle={{
                position: 'relative',
                cursor: canModify && 'pointer',
                zIndex: node.depth + 2,
              }}
              end={getGateInputId(
                nodeIdsToIsSummaryGate[child.id],
                node.id,
                child.id,
              )}
              endAnchor={arrowAnchorPositions}
              headSize={arrowProperties.headSize}
              passProps={{ onClick: (event) => onArrowClick(event, arrowId) }}
              start={getNodeConnectionPointId(node.id)}
              startAnchor={arrowAnchorPositions}
              strokeWidth={arrowProperties.strokeWidth * scale}
              SVGcanvasStyle={{ transform: `scale(${1 / scale})` }}
            />
          );
        }),
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  canModify: state.learningMap.canModify,
  nodes: state.learningMap.nodes,
  selectedElement: state.learningMap.selectedElement,
});

NodeToGateArrows.propTypes = {
  arrowAnchorPositions: PropTypes.arrayOf(PropTypes.string).isRequired,
  arrowProperties: arrowPropertiesShape.isRequired,
  canModify: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  gateInputSizeThreshold: PropTypes.number.isRequired,
  getArrowId: PropTypes.func.isRequired,
  getGateInputId: PropTypes.func.isRequired,
  getNodeConnectionPointId: PropTypes.func.isRequired,
  nodes: PropTypes.arrayOf(nodeShape).isRequired,
  selectedElement: selectedElementShape.isRequired,
  scale: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(NodeToGateArrows);
