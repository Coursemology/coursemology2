import CourseAPI from 'api/course';
import { actionTypes } from './constants';

function getErrorMessage(error) {
  const errors = error.response.data.errors;
  return errors.length > 0 ? errors[0] : '';
}

export function fetchNodes() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOADING });

    return CourseAPI.learningMap
      .index()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_LEARNING_MAP_SUCCESS,
          nodes: response.data.nodes,
          canModify: response.data.canModify,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_LEARNING_MAP_FAILURE });
      });
  };
}

export function addParentNode(parentNodeId, nodeId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOADING });

    return CourseAPI.learningMap
      .addParentNode({
        parent_node_id: parentNodeId,
        node_id: nodeId,
      })
      .then((response) => {
        dispatch({
          type: actionTypes.ADD_PARENT_NODE_SUCCESS,
          nodes: response.data.nodes,
        });
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.ADD_PARENT_NODE_FAILURE,
          errorMessage: getErrorMessage(error),
        });
      });
  };
}

export function removeParentNode(parentNodeId, nodeId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOADING });

    return CourseAPI.learningMap
      .removeParentNode({
        parent_node_id: parentNodeId,
        node_id: nodeId,
      })
      .then((response) => {
        dispatch({
          type: actionTypes.REMOVE_PARENT_NODE_SUCCESS,
          nodes: response.data.nodes,
        });
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.REMOVE_PARENT_NODE_FAILURE,
          errorMessage: getErrorMessage(error),
        });
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

export function resetSelection() {
  return (dispatch) => {
    dispatch({ type: actionTypes.RESET_SELECTION });
  };
}

export function toggleSatisfiabilityType(nodeId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOADING });

    return CourseAPI.learningMap
      .toggleSatisfiabilityType({
        node_id: nodeId,
      })
      .then((response) => {
        dispatch({
          type: actionTypes.TOGGLE_SATISFIABILITY_TYPE_SUCCESS,
          nodes: response.data.nodes,
        });
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.TOGGLE_SATISFIABILITY_TYPE_FAILURE,
          errorMessage: getErrorMessage(error),
        });
      });
  };
}
