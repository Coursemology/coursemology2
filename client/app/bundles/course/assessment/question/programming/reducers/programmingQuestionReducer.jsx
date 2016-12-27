import Immutable from 'immutable';

import actionTypes from '../constants/programmingQuestionConstants';
import editorActionTypes from '../constants/onlineEditorConstants'

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
    show_attempt_limit: false,
    attempt_limit: null,
    import_job_id: null,
    package: null,
    can_switch_package_type: true,
    can_edit_online: true,
  },
  package_ui: {
    templates: [],
    selected: null,
    test_cases: {
      evaluation: [],
      private: [],
      public: [],
    }
  },
  test_ui: {
    mode: null,
    python: {
      prepend: '',
      append: '',
      solution: '',
      submission: '',
      test_cases: {
        evaluation: [],
        private: [],
        public: [],
      }
    }
  },
  import_result: {
    alert: null,
    build_log: null
  },
  is_loading: false,
  is_evaluating: false,
  form_data: {
    method: 'post',
    path: null,
    auth_token: null,
    async: false
  },
});

function questionReducer(state, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.PROGRAMMING_QUESTION_UPDATE:
      const { field, newValue } = action;
      return state.set(field, newValue);

    case actionTypes.SKILLS_UPDATE:
      const { skills } = action;
      return state.set('skill_ids', Immutable.fromJS(skills));

    default:
      return state;
  }
}

function pythonTestReducer(state, action) {
  const { type } = action;
  var field, newValue, testType, index, testCases, tests;

  switch (type) {
    case editorActionTypes.PYTHON_CODE_BLOCK_UPDATE:
      ({ field, newValue } = action);
      return state.set(field, newValue);

    case editorActionTypes.PYTHON_TEST_CASE_CREATE:
      ({ testType } = action);
      const newTest = {
        expression: '',
        expected: '',
        hint: ''
      };
      tests = state.get('test_cases').get(testType).push(Immutable.fromJS(newTest));
      return state.setIn(['test_cases', testType], tests);

    case editorActionTypes.PYTHON_TEST_CASE_UPDATE:
      ({ testType, index, field, newValue } = action);
      return state.setIn(['test_cases', testType, index, field], newValue);

    case editorActionTypes.PYTHON_TEST_CASE_DELETE:
      ({ testType, index } = action);
      tests = state.get('test_cases').get(testType).splice(index, 1);
      return state.setIn(['test_cases', testType], tests);

    default:
      return state;
  }
}

function apiReducer(state, action) {
  const { type } = action;
  var data = null;

  switch (type) {
    case actionTypes.SUBMIT_FORM_LOADING:
      const { isLoading } = action;
      return state.set('is_loading', isLoading);

    case actionTypes.SUBMIT_FORM_EVALUATING:
      const { isEvaluating } = action;
      ({ data } = action);

      if (data) {
        const { question, package_ui, test_ui, import_result } = data;

        return state
          .set('is_evaluating', isEvaluating)
          .mergeDeep({ question, package_ui, test_ui, import_result });
      } else {
        return state
          .set('is_evaluating', isEvaluating)
          .mergeIn(['import_result'], { alert: null, build_log: null });
      }

    case actionTypes.SUBMIT_FORM_SUCCESS:
      ({ data } = action);
      const { question, package_ui, test_ui, import_result } = data;

      return state.mergeDeep({ question, package_ui, test_ui, import_result });

    case actionTypes.SUBMIT_FORM_FAILURE:
      const { error } = action;
      return state;

    default:
      return state;
  }
}

export default function programmingQuestionReducer(state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SKILLS_UPDATE:
    case actionTypes.PROGRAMMING_QUESTION_UPDATE:
      return state.set('question', questionReducer(state.get('question'), action));

    case actionTypes.EDITOR_MODE_UPDATE:
      const { mode } = action;
      return state.setIn(['test_ui', 'mode'], mode);

    case actionTypes.TEMPLATE_TAB_UPDATE:
      const { selected } = action;
      return state.setIn(['package_ui', 'selected'], selected);

    case editorActionTypes.PYTHON_TEST_CASE_CREATE:
    case editorActionTypes.PYTHON_TEST_CASE_UPDATE:
    case editorActionTypes.PYTHON_TEST_CASE_DELETE:
    case editorActionTypes.PYTHON_CODE_BLOCK_UPDATE:
      const pythonTest = state.get('test_ui').get('python');
      return state.setIn(['test_ui', 'python'], pythonTestReducer(pythonTest, action));

    case actionTypes.SUBMIT_FORM_EVALUATING:
    case actionTypes.SUBMIT_FORM_LOADING:
    case actionTypes.SUBMIT_FORM_SUCCESS:
    case actionTypes.SUBMIT_FORM_FAILURE:
      return apiReducer(state, action);

    default:
      return state;
  }
}
