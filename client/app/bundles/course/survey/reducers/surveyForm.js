import actionTypes from '../constants';

const initialState = {
  visible: false,
  disabled: false,
  onSubmit: () => {},
  formTitle: '',
  hasStudentResponse: false,
  initialValues: {},
};

export default function (state = initialState, action) {
  const { type } = action;
  switch (type) {
    case actionTypes.SURVEY_FORM_SHOW: {
      return { ...state, ...action.formParams, visible: true };
    }
    case actionTypes.SURVEY_FORM_HIDE: {
      return { ...state, visible: false };
    }
    case actionTypes.CREATE_SURVEY_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.CREATE_SURVEY_SUCCESS:
    case actionTypes.CREATE_SURVEY_FAILURE: {
      return { ...state, disabled: false };
    }
    default:
      return state;
  }
}
