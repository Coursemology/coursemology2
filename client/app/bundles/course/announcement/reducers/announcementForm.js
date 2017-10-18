import actionTypes from '../constants';

const initialState = {
  visible: false,
  disabled: false,
  onSubmit: () => {},
  formTitle: '',
  initialValues: {},
};

export default function (state = initialState, action) {
  const { type } = action;
  switch (type) {
    case actionTypes.ANNOUNCEMENT_FORM_SHOW: {
      return { ...state, ...action.formParams, visible: true };
    }
    case actionTypes.ANNOUNCEMENT_FORM_HIDE: {
      return { ...state, visible: false };
    }
    case actionTypes.CREATE_ANNOUNCEMENT_REQUEST:
    case actionTypes.UPDATE_ANNOUNCEMENT_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.CREATE_ANNOUNCEMENT_SUCCESS:
    case actionTypes.CREATE_ANNOUNCEMENT_FAILURE:
    case actionTypes.UPDATE_ANNOUNCEMENT_SUCCESS:
    case actionTypes.UPDATE_ANNOUNCEMENT_FAILURE: {
      return { ...state, disabled: false };
    }
    default:
      return state;
  }
}
