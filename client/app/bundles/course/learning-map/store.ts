import produce from 'immer';

import { actionTypes, elementTypes } from './constants';
import { LearningMapState } from './types';

const initialState: LearningMapState = {
  canModify: false,
  isLoading: false,
  nodes: [],
  response: {},
  selectedElement: {
    id: '',
    type: elementTypes.NODE,
  },
};

const reducer = produce((state, action) => {
  switch (action.type) {
    case actionTypes.FETCH_LEARNING_MAP_SUCCESS:
      return {
        ...state,
        canModify: action.canModify,
        isLoading: false,
        nodes: action.nodes,
      };

    case actionTypes.FETCH_LEARNING_MAP_FAILURE:
      return {
        ...state,
        isLoading: false,
        response: {
          didSucceed: false,
          message: 'Failed to load learning map. Please try again later.',
        },
      };

    case actionTypes.ADD_PARENT_NODE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        nodes: action.nodes,
        response: {
          didSucceed: true,
          message: 'Successfully added condition.',
        },
        selectedElement: {},
      };

    case actionTypes.ADD_PARENT_NODE_FAILURE:
      return {
        ...state,
        isLoading: false,
        response: {
          didSucceed: false,
          message: `Failed to add condition.${
            action.errorMessage && ` (${action.errorMessage})`
          }`,
        },
        selectedElement: {},
      };

    case actionTypes.REMOVE_PARENT_NODE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        nodes: action.nodes,
        response: {
          didSucceed: true,
          message: 'Successfully deleted condition.',
        },
        selectedElement: {},
      };

    case actionTypes.REMOVE_PARENT_NODE_FAILURE:
      return {
        ...state,
        isLoading: false,
        response: {
          didSucceed: false,
          message: `Failed to delete condition.${
            action.errorMessage && ` (${action.errorMessage})`
          }`,
        },
        selectedElement: {},
      };

    case actionTypes.SELECT_ARROW:
      return {
        ...state,
        response: {},
        selectedElement: {
          type: elementTypes.arrow,
          id: action.selectedArrowId,
        },
      };

    case actionTypes.SELECT_GATE:
      return {
        ...state,
        response: {},
        selectedElement: {
          type: elementTypes.gate,
          id: action.selectedGateId,
        },
      };

    case actionTypes.SELECT_PARENT_NODE:
      return {
        ...state,
        response: {},
        selectedElement: {
          type: elementTypes.parentNode,
          id: action.selectedParentNodeId,
        },
      };

    case actionTypes.TOGGLE_SATISFIABILITY_TYPE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        nodes: action.nodes,
        response: {
          didSucceed: true,
          message: 'Successfully toggled satisfiability type.',
        },
        selectedElement: {},
      };

    case actionTypes.TOGGLE_SATISFIABILITY_TYPE_FAILURE:
      return {
        ...state,
        isLoading: false,
        response: {
          didSucceed: false,
          message: `Failed to toggle satisfiability type.${
            action.errorMessage && ` (${action.errorMessage})`
          }`,
        },
        selectedElement: {},
      };

    case actionTypes.RESET_SELECTION:
      return {
        ...state,
        response: {},
        selectedElement: {},
      };

    case actionTypes.LOADING:
      return {
        ...state,
        isLoading: true,
      };

    default:
      return state;
  }
}, initialState);

export default reducer;
