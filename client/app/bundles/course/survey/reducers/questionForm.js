import actionTypes from '../constants';

const initialState = {
  visible: false,
  disabled: false,
  onSubmit: () => {},
  formTitle: '',
  initialValues: {},
};

export default function(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case actionTypes.QUESTION_FORM_SHOW: {
      return { ...state, ...action.formParams, visible: true };
    }
    case actionTypes.QUESTION_FORM_HIDE: {
      return { ...state, visible: false };
    }
    case actionTypes.UPDATE_SURVEY_QUESTION_REQUEST:
    case actionTypes.CREATE_SURVEY_QUESTION_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.UPDATE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.UPDATE_SURVEY_QUESTION_FAILURE:
    case actionTypes.CREATE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_QUESTION_FAILURE: {
      return { ...state, disabled: false };
    }
    default:
      return state;
  }
}
