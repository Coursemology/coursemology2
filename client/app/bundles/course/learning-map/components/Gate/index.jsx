import React from 'react';
import ConnectionPoint from '../ConnectionPoint';
import { connect } from 'react-redux';
import { addParentNode, selectGate } from 'course/learning-map/actions';
import ReactTooltip from 'react-tooltip';
import { green300, red300 } from 'material-ui/styles/colors';

const styles = {
  andGate: {
    border: '1px solid black',
    cursor: 'pointer',
    position: 'relative',
  },
  andGateInput: {
    border: '1px solid black',
    backgroundColor: 'white',
    height: '18px',
    width: '8px',
  },
  orGate: {
    cursor: 'pointer',
    border: '1px solid black',
    position: 'relative',
  },
  orGateInput: {
    backgroundColor: 'white',
    height: '18px',
    width: '8px',
  },
  selectedGate: {
    boxShadow: '0px 0px 2px 2px #3297fd',
  },
  summaryGate: {
    backgroundColor: 'white',
    border: '1px solid black',
    cursor: 'pointer',
    height: '20px',
    padding: '0px 2px',
    position: 'relative',
  },
  wrapper: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    position: 'relative',
  },
};

const Gate = (props) => {
  const {
    canModify,
    dispatch,
    gateInputSizeThreshold,
    getGateConnectionPointId,
    getGateId,
    getGateInputId,
    node,
    selectedParentNodeId,
    selectedGateId,
  } = props;
  const id = getGateId(node.id);
  const zIndex = node.depth + 2;

  const onGateClick = (event) => {
    if (canModify) {
      event.stopPropagation();
      dispatch(selectGate(id));
    }
  };

  const onConnectionPointClick = (event, nodeId) => {
    event.stopPropagation();
    dispatch(addParentNode(selectedParentNodeId, nodeId));
  };

  const isAndGate = () => {
    return node.satisfiability_type === 'all_conditions';
  };

  const isSummaryGate = () => {
    return node.parents.length > gateInputSizeThreshold;
  };

  const getGateBackgroundColor = (isSatisfied) => {
    return canModify ? 'white' : isSatisfied ? `${green300}` : `${red300}`;
  };

  const andGate = () => {
    return (
      <div
        id={id}
        style={{...styles.andGate, ...(selectedGateId === id) && styles.selectedGate, zIndex: zIndex}}
      >
        {
          node.parents.sort((parent1, parent2) => parent1.id.localeCompare(parent2.id)).map(parent => {
            const inputId = getGateInputId(false, parent.id, node.id);

            return (              
              <div
                id={inputId}
                key={inputId}
                style={{...styles.andGateInput, backgroundColor: getGateBackgroundColor(parent.is_satisfied)}}
              >
              </div>
            );
          })
        }
      </div>
    );
  };

  const orGate = () => {
    return (
      <div
        id={id}
        style={{...styles.orGate, ...(selectedGateId === id) && styles.selectedGate, zIndex: zIndex}}
      >
        {
          node.parents.sort((parent1, parent2) => parent1.id.localeCompare(parent2.id)).map(parent => {
            const inputId = getGateInputId(false, parent.id, node.id);

            return (
              <div
                id={inputId}
                key={inputId}
                style={{...styles.orGateInput, backgroundColor: getGateBackgroundColor(node.unlocked)}}
              >
              </div>
            );
          })
        }
      </div>
    );
  };

  const summaryGate = () => {
    const numSatisfiedConditions = node.parents.filter(parent => parent.is_satisfied).length;

    return (
      <div id={id}>
        <div
          id={getGateInputId(true, '', node.id)}
          style={{
            ...styles.summaryGate,
            ...(selectedGateId === id) && styles.selectedGate,
            backgroundColor: getGateBackgroundColor(node.unlocked),
            zIndex: zIndex,
          }}
        >
          {`${numSatisfiedConditions}/${node.parents.length}`}
        </div>
      </div>
    );
  };

  const getGate = () => {
    if (isSummaryGate()) {
      return summaryGate();
    }

    if (isAndGate()) {
      return andGate();
    }

    return orGate();
  };

  const tooltipMetadata = {
    id: `${id}-tooltip`,
    message: `Satisfy ${ isAndGate() ? 'all conditions' : 'at least one condition' } to unlock`,
  };

  return (
    <>
      <div style={{...styles.wrapper}}>
        <div
          data-tip
          data-for={tooltipMetadata.id}
        >
          <div onClick={event => onGateClick(event)}>
            { getGate() }
          </div>
          <ReactTooltip id={tooltipMetadata.id}>
            { tooltipMetadata.message }
          </ReactTooltip>
        </div>
        <ConnectionPoint
          id={getGateConnectionPointId(node.id)}
          isActive={selectedParentNodeId}
          onClick={(event) => onConnectionPointClick(event, node.id)}
          zIndex={selectedParentNodeId ? 9999 : zIndex}
        />
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  canModify: state.learningMap.canModify,
  selectedParentNodeId: state.learningMap.selectedParentNodeId,
  selectedGateId: state.learningMap.selectedGateId,
});

export default connect(mapStateToProps)(Gate);
