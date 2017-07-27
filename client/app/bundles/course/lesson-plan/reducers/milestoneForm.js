import actionTypes from '../constants';

export const initialState = {
  visible: false,
  disabled: false,
  onSubmit: () => {},
  formTitle: '',
  initialValues: {},
};

export default function (state = initialState, action) {
  const { type } = action;
  switch (type) {
    case actionTypes.MILESTONE_FORM_SHOW: {
      return { ...state, ...action.formParams, visible: true };
    }
    case actionTypes.MILESTONE_FORM_HIDE: {
      return { ...state, visible: false };
    }
    case actionTypes.MILESTONE_UPDATE_REQUEST:
    case actionTypes.MILESTONE_CREATE_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.MILESTONE_UPDATE_SUCCESS:
    case actionTypes.MILESTONE_UPDATE_FAILURE:
    case actionTypes.MILESTONE_CREATE_SUCCESS:
    case actionTypes.MILESTONE_CREATE_FAILURE: {
      return { ...state, disabled: false };
    }
    default:
      return state;
  }
}
