import actionTypes from '../constants';

const initialState = {
  canModify: false,
  isLoading: false,
  nodes: [],
  response: {},
  selectedArrowId: '',
  selectedParentNodeId: '',
  selectedGateId: '',
};

export default function (state = initialState, action) {
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
          message: 'Successfully added arrow.',
        },
        selectedParentNodeId: '',
      };

    case actionTypes.ADD_PARENT_NODE_FAILURE:
      return {
        ...state,
        isLoading: false,
        response: {
          didSucceed: false,
          message: 'Failed to add arrow.',
        },
        selectedParentNodeId: '',
      };
    
    case actionTypes.REMOVE_PARENT_NODE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        nodes: action.nodes,
        response: {
          didSucceed: true,
          message: 'Successfully removed arrow.',
        },
        selectedArrowId: '',
      };

    case actionTypes.REMOVE_PARENT_NODE_FAILURE:
      return {
        ...state,
        isLoading: false,
        response: {
          didSucceed: false,
          message: 'Failed to remove arrow.',
        },
        selectedArrowId: '',
      };
    
    case actionTypes.SELECT_ARROW:
      return {
        ...state,
        response: {},
        selectedArrowId: action.selectedArrowId,
        selectedParentNodeId: '',
        selectedGateId: '',
      };
    
    case actionTypes.SELECT_GATE:
      return {
        ...state,
        selectedArrowId: '',
        selectedParentNodeId: '',
        selectedGateId: action.selectedGateId,
      };

    case actionTypes.SELECT_PARENT_NODE:
      return {
        ...state,
        response: {},
        selectedArrowId: '',
        selectedParentNodeId: action.selectedParentNodeId,
        selectedGateId: '',
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
        selectedGateId: '',
      };
    
    case actionTypes.TOGGLE_SATISFIABILITY_TYPE_FAILURE:
      return {
        ...state,
        isLoading: false,
        response: {
          didSucceed: false,
          message: 'Failed to toggle satisfiability type.',
        },
        selectedGateId: '',
      };

    case actionTypes.RESET_SELECTION:
      return {
        ...state,
        response: {},
        selectedArrowId: '',
        selectedParentNodeId: '',
        selectedGateId: '',
      };

    case actionTypes.LOADING:
      return {
        ...state,
        isLoading: true,
      };

    default:
      return state;
  }
}
