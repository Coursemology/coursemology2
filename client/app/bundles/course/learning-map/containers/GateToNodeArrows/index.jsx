import React from 'react';
import { connect } from 'react-redux';
import Xarrow from 'react-xarrows';
import {
  arrowProperties,
  nodeShape,
} from '../../propTypes';
import PropTypes from 'prop-types';

const GateToNodeArrows = (props) => {
  const {
    arrowAnchorPositions,
    arrowProperties,
    getGateConnectionPointId,
    nodes,
    scale,
  } = props;

  return (
    nodes.map(node => {
      return (
        <Xarrow
          key={node.id}
          start={getGateConnectionPointId(node.id)}
          startAnchor={arrowAnchorPositions}
          end={node.id}
          endAnchor={arrowAnchorPositions}
          color={arrowProperties.defaultColor}
          divContainerStyle={{position: 'relative'}}
          headSize={arrowProperties.headSize}
          strokeWidth={arrowProperties.strokeWidth * scale}
          SVGcanvasStyle={{transform: `scale(${1 / scale})`}}
        />
      );
    })
  );
};

const mapStateToProps = (state) => ({
  nodes: state.learningMap.nodes,
});

GateToNodeArrows.propTypes = {
  arrowAnchorPositions: PropTypes.arrayOf(PropTypes.string).isRequired,
  arrowProperties: arrowProperties.isRequired,
  getGateConnectionPointId: PropTypes.func.isRequired,
  nodes: nodeShape.isRequired,
  scale: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(GateToNodeArrows);
