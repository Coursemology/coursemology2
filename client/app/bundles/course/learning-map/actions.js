import CourseAPI from 'api/course';
import actionTypes from './constants';

export function fetchNodes() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOADING });

    return CourseAPI.learningMap.index()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_LEARNING_MAP_SUCCESS,
          nodes: response.data.nodes,
          canModify: response.data.can_modify,
        });
      }).catch(() => {
        dispatch({ type: actionTypes.FETCH_LEARNING_MAP_FAILURE });
      });
  };
}

export function addParentNode(parentNodeId, nodeId) {
  if (parentNodeId !== '') {
    return (dispatch) => {
      dispatch({ type: actionTypes.LOADING });

      return CourseAPI.learningMap.addParentNode({
        parent_node_id: parentNodeId,
        node_id: nodeId,
      }).then((response) => {
        dispatch({
          type: actionTypes.ADD_PARENT_NODE_SUCCESS,
          nodes: response.data.nodes,
        });
      }).catch(() => {
        dispatch({ type: actionTypes.ADD_PARENT_NODE_FAILURE });
      });
    };
  }
}

export function removeParentNode(parentNodeId, nodeId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOADING });

    return CourseAPI.learningMap.removeParentNode({
      parent_node_id: parentNodeId,
      node_id: nodeId,
    }).then((response) => {
      dispatch({
        type: actionTypes.REMOVE_PARENT_NODE_SUCCESS,
        nodes: response.data.nodes,
      });
    }).catch(() => {
      dispatch({ type: actionTypes.REMOVE_PARENT_NODE_FAILURE });
    });
  };
}

export function selectArrow(arrowId) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SELECT_ARROW,
      selectedArrowId: arrowId,
    });
  };
}

export function selectGate(gateId) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SELECT_GATE,
      selectedGateId: gateId,
    });
  };
}

export function selectParentNode(nodeId) {
  return (dispatch) => {
    dispatch({ 
      type: actionTypes.SELECT_PARENT_NODE,
      selectedParentNodeId: nodeId,
    });
  };
}

export function resetSelection() {
  return (dispatch) => {
    dispatch({ type: actionTypes.RESET_SELECTION });
  };
}

export function toggleSatisfiabilityType(nodeId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOADING });

    return CourseAPI.learningMap.toggleSatisfiabilityType({
      node_id: nodeId,
    }).then((response) => {
      dispatch({
        type: actionTypes.TOGGLE_SATISFIABILITY_TYPE_SUCCESS,
        nodes: response.data.nodes,
      });
    }).catch(() => {
      dispatch({ type: actionTypes.TOGGLE_SATISFIABILITY_TYPE_FAILURE });
    });
  };
}
