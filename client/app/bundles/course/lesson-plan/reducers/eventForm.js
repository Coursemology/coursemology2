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
    case actionTypes.EVENT_FORM_SHOW: {
      return { ...state, ...action.formParams, visible: true };
    }
    case actionTypes.EVENT_FORM_HIDE: {
      return { ...state, visible: false };
    }
    case actionTypes.EVENT_UPDATE_REQUEST:
    case actionTypes.EVENT_CREATE_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.EVENT_UPDATE_SUCCESS:
    case actionTypes.EVENT_UPDATE_FAILURE:
    case actionTypes.EVENT_CREATE_SUCCESS:
    case actionTypes.EVENT_CREATE_FAILURE: {
      return { ...state, disabled: false };
    }
    default:
      return state;
  }
}
