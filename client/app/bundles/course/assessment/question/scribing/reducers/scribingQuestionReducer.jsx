import actionTypes from '../constants';

export const initialState = {
  question: {
    id: null,
    title: '',
    description: '',
    staff_only_comments: '',
    maximum_grade: 0,
    weight: 0,
    skill_ids: [],
    skills: [],
    published_assessment: false,
    attempt_limit: null,
  },
  isLoading: false,
  save_errors: undefined,
};

function apiReducer(state, action) {
  const { type } = action;
  switch (type) {
    case actionTypes.FETCH_SCRIBING_QUESTION_REQUEST:
    case actionTypes.CREATE_RESPONSE_REQUEST:
    case actionTypes.UPDATE_SCRIBING_QUESTION_REQUEST:
    case actionTypes.SUBMIT_FORM_LOADING: {
      const { isLoading } = action;
      return {
        ...state,
        is_loading: isLoading,
        save_errors: undefined,
      };
    }
    case actionTypes.FETCH_SCRIBING_QUESTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.UPDATE_SCRIBING_QUESTION_SUCCESS:
    case actionTypes.SUBMIT_FORM_SUCCESS: {
      const { question } = action.data;
      question.maximum_grade = parseInt(question.maximum_grade, 10);
      return {
        ...state,
        question,
        is_loading: false,
      };
    }
    case actionTypes.FETCH_SCRIBING_QUESTION_FAILURE:
    case actionTypes.CREATE_SURVEY_QUESTION_FAILURE:
    case actionTypes.UPDATE_SURVEY_QUESTION_FAILURE:
    case actionTypes.SUBMIT_FORM_FAILURE: {
      return {
        ...state,
        is_loading: false,
      };
    }
    default: {
      return state;
    }
  }
}

export default function scribingQuestionReducer(state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_SCRIBING_QUESTION_REQUEST:
    case actionTypes.FETCH_SCRIBING_QUESTION_SUCCESS:
    case actionTypes.FETCH_SCRIBING_QUESTION_FAILURE:
    case actionTypes.SUBMIT_FORM_LOADING:
    case actionTypes.SUBMIT_FORM_SUCCESS:
    case actionTypes.SUBMIT_FORM_FAILURE: {
      return apiReducer(state, action);
    }
    default: {
      return state;
    }
  }
}
