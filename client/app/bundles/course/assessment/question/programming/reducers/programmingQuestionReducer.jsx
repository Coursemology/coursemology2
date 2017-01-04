import Immutable from 'immutable';

import actionTypes from '../constants/programmingQuestionConstants';

export const initialState = Immutable.fromJS({
  // this is the default state that would be used if one were not passed into the store
  question: {
    assessment_id: null,
    id: null,
    title: '',
    description: '',
    staff_only_comments: '',
    maximum_grade: 0,
    weight: 0,
    language_id: null,
    languages: [],
    skill_ids: [],
    skills: [],
    memory_limit: null,
    time_limit: null,
    autograded_assessment: false,
    published_assessment: false,
    attempt_limit: null,
    import_job_id: null,
    package: null,
    can_switch_package_type: true,
    edit_online: true,
    package_filename: null,
  },
  package_ui: {
    templates: [],
    test_cases: {
      evaluation: [],
      private: [],
      public: [],
    },
  },
  test_ui: {
    mode: null,
    python: {
      autograded: false,
      prepend: '',
      append: '',
      solution: '',
      submission: '',
      test_cases: {
        evaluation: [],
        private: [],
        public: [],
      },
    },
  },
  import_result: {
    alert: null,
    build_log: null,
  },
  is_loading: false,
  is_evaluating: false,
  has_errors: false,
  show_submission_message: false,
  submission_message: '',
  form_data: {
    method: 'post',
    path: null,
    auth_token: null,
    async: false,
  },
});

function questionReducer(state, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.PROGRAMMING_QUESTION_UPDATE: {
      const { field, newValue } = action;
      return state.set(field, newValue).deleteIn(['error', field]);
    }
    case actionTypes.SKILLS_UPDATE: {
      const { skills } = action;
      return state.set('skill_ids', Immutable.fromJS(skills));
    }
    default: {
      return state;
    }
  }
}

function apiReducer(state, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SUBMIT_FORM_LOADING: {
      const { isLoading } = action;
      return state.set('is_loading', isLoading);
    }
    case actionTypes.SUBMIT_FORM_EVALUATING: {
      const { isEvaluating, data } = action;

      if (data) {
        const { question, package_ui, test_ui, import_result } = data;

        return state
          .set('is_evaluating', isEvaluating)
          .mergeDeep({ question })
          .setIn(['question', 'package_filename'], null)
          .merge({ test_ui, package_ui, import_result });
      }

      return state
        .set('is_evaluating', isEvaluating)
        .mergeIn(['import_result'], { alert: null, build_log: null });
    }
    case actionTypes.SUBMIT_FORM_SUCCESS: {
      const { data } = action;
      const { question, package_ui, test_ui, import_result } = data;

      return state
        .mergeDeep({ question })
        .merge({ test_ui, package_ui, import_result });
    }
    case actionTypes.SUBMIT_FORM_FAILURE: {
      return state;
    }
    default: {
      return state;
    }
  }
}

export default function programmingQuestionReducer(state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SKILLS_UPDATE:
    case actionTypes.PROGRAMMING_QUESTION_UPDATE: {
      return state.set('question', questionReducer(state.get('question'), action));
    }
    case actionTypes.EDITOR_MODE_UPDATE: {
      const { mode } = action;
      return state.setIn(['test_ui', 'mode'], mode);
    }
    case actionTypes.SUBMIT_FORM_EVALUATING:
    case actionTypes.SUBMIT_FORM_LOADING:
    case actionTypes.SUBMIT_FORM_SUCCESS:
    case actionTypes.SUBMIT_FORM_FAILURE: {
      return apiReducer(state, action);
    }
    case actionTypes.VALIDATION_ERRORS_SET: {
      const { errors } = action;
      let newState = state;

      errors.forEach((error) => {
        newState = newState.setIn(error.path, Immutable.fromJS(error.error));
      });

      return newState.set('has_errors', errors.length !== 0);
    }
    case actionTypes.HAS_ERROR_CLEAR: {
      return state.set('has_errors', false);
    }
    case actionTypes.SUBMISSION_MESSAGE_SET: {
      const { message } = action;
      return state.set('show_submission_message', true).set('submission_message', message);
    }
    case actionTypes.SUBMISSION_MESSAGE_CLEAR: {
      return state.set('show_submission_message', false).set('submission_message', '');
    }
    default: {
      return state;
    }
  }
}
