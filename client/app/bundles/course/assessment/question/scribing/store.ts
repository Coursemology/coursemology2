import produce from 'immer';

import actionTypes from './constants';
import { ScribingQuestionState } from './types';

const initialState: ScribingQuestionState = {
  question: {
    id: null,
    title: '',
    description: '',
    staff_only_comments: '',
    maximum_grade: '',
    weight: 0,
    skill_ids: [],
    skills: [],
    attachment_reference: null,
    published_assessment: false,
  },
  isLoading: false,
  isSubmitting: false,
};

const reducer = produce((state, action) => {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_SKILLS_REQUEST:
    case actionTypes.FETCH_SCRIBING_QUESTION_REQUEST:
      return {
        ...state,
        isLoading: true,
        isSubmitting: false,
      };
    case actionTypes.CREATE_SCRIBING_QUESTION_REQUEST:
    case actionTypes.UPDATE_SCRIBING_QUESTION_REQUEST:
    case actionTypes.CREATE_SCRIBING_QUESTION_SUCCESS:
    case actionTypes.UPDATE_SCRIBING_QUESTION_SUCCESS: {
      return {
        ...state,
        isLoading: false,
        isSubmitting: true, // to provide transition to assessment page
      };
    }
    case actionTypes.FETCH_SKILLS_SUCCESS: {
      return {
        ...state,
        question: { ...state.question, skills: action.skills },
        isLoading: false,
        isSubmitting: false,
      };
    }
    case actionTypes.FETCH_SCRIBING_QUESTION_SUCCESS: {
      const { question } = action.data;
      question.maximum_grade = parseInt(question.maximum_grade, 10);
      return {
        ...state,
        question,
        isLoading: false,
        isSubmitting: false,
      };
    }
    case actionTypes.FETCH_SKILLS_FAILURE:
    case actionTypes.FETCH_SCRIBING_QUESTION_FAILURE:
    case actionTypes.CREATE_SCRIBING_QUESTION_FAILURE:
    case actionTypes.UPDATE_SCRIBING_QUESTION_FAILURE: {
      return {
        ...state,
        isLoading: false,
        isSubmitting: false,
      };
    }
    default: {
      return state;
    }
  }
}, initialState);

export default reducer;
