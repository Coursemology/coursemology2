import { connect } from 'react-redux';
import Xarrow from 'react-xarrows';
import PropTypes from 'prop-types';

import { arrowPropertiesShape, nodeShape } from '../../propTypes';

const GateToNodeArrows = (props) => {
  const {
    arrowAnchorPositions,
    arrowProperties,
    getGateConnectionPointId,
    nodes,
    scale,
  } = props;

  return nodes.map(
    (node) =>
      node.depth > 0 && (
        <Xarrow
          key={node.id}
          color={arrowProperties.defaultColor}
          divContainerStyle={{ position: 'relative' }}
          end={node.id}
          endAnchor={arrowAnchorPositions}
          headSize={arrowProperties.headSize}
          start={getGateConnectionPointId(node.id)}
          startAnchor={arrowAnchorPositions}
          strokeWidth={arrowProperties.strokeWidth * scale}
          SVGcanvasStyle={{ transform: `scale(${1 / scale})` }}
        />
      ),
  );
};

const mapStateToProps = (state) => ({
  nodes: state.learningMap.nodes,
});

GateToNodeArrows.propTypes = {
  arrowAnchorPositions: PropTypes.arrayOf(PropTypes.string).isRequired,
  arrowProperties: arrowPropertiesShape.isRequired,
  getGateConnectionPointId: PropTypes.func.isRequired,
  nodes: PropTypes.arrayOf(nodeShape).isRequired,
  scale: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(GateToNodeArrows);
