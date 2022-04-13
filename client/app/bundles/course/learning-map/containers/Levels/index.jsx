import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { nodeShape } from '../../propTypes';
import Gate from '../../components/Gate';
import Node from '../../components/Node';

const styles = {
  level: {
    alignItems: 'top',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: '10px 30px',
  },
  nodeWithGate: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  wrapper: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
};

const Levels = (props) => {
  const {
    gateInputSizeThreshold,
    getGateConnectionPointId,
    getGateId,
    getGateInputId,
    getNodeConnectionPointId,
    nodes,
  } = props;

  const maxDepth =
    nodes.length > 0
      ? nodes.reduce((prev, cur) => (cur.depth > prev.depth ? cur : prev)).depth
      : 0;
  const levels = [...Array(maxDepth + 1)].map(() => []);
  nodes.forEach((node) => levels[node.depth].push(node));

  return (
    <div style={styles.wrapper}>
      {levels.map((level, index) => (
        <div key={`level-${index + 1}`} style={styles.level}>
          {level
            .sort((node1, node2) => node1.id.localeCompare(node2.id))
            .map((node) => (
              <div key={node.id} style={styles.nodeWithGate}>
                <>
                  {node.depth > 0 && (
                    <Gate
                      gateInputSizeThreshold={gateInputSizeThreshold}
                      getGateConnectionPointId={getGateConnectionPointId}
                      getGateId={getGateId}
                      getGateInputId={getGateInputId}
                      key={getGateId(node.id)}
                      node={node}
                    />
                  )}
                  <Node
                    key={node.id}
                    node={node}
                    getNodeConnectionPointId={getNodeConnectionPointId}
                  />
                </>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

const mapStateToProps = (state) => ({
  nodes: state.learningMap.nodes,
});

Levels.propTypes = {
  gateInputSizeThreshold: PropTypes.number.isRequired,
  getGateConnectionPointId: PropTypes.func.isRequired,
  getGateId: PropTypes.func.isRequired,
  getGateInputId: PropTypes.func.isRequired,
  getNodeConnectionPointId: PropTypes.func.isRequired,
  nodes: PropTypes.arrayOf(nodeShape).isRequired,
};

export default connect(mapStateToProps)(React.memo(Levels));
