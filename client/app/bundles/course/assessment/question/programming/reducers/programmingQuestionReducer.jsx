import Immutable from 'immutable';

import actionTypes from '../constants/programmingQuestionConstants';
import editorActionTypes from '../constants/onlineEditorConstants'

export const $$initialState = Immutable.fromJS({
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
  alert: null,
  form_data: {
    path: null,
    auth_token: null
  },
});

function questionReducer($$state, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.PROGRAMMING_QUESTION_UPDATE:
      const { field, newValue } = action;
      return $$state.set(field, newValue);

    case actionTypes.SKILLS_UPDATE:
      const { skills } = action;
      return $$state.set('skill_ids', Immutable.fromJS(skills));

    default:
      return $$state;
  }
}

function pythonTestReducer($$state, action) {
  const { type } = action;
  var field, newValue, testType, index, $$testCases, $$tests;

  switch (type) {
    case editorActionTypes.PYTHON_CODE_BLOCK_UPDATE:
      ({ field, newValue } = action);
      return $$state.set(field, newValue);

    case editorActionTypes.PYTHON_TEST_CASE_CREATE:
      ({ testType } = action);
      const newTest = {
        expression: '',
        expected: '',
        hint: ''
      };
      $$testCases = $$state.get('test_cases');
      $$tests = $$testCases.get(testType).push(Immutable.fromJS(newTest));
      return $$state.set('test_cases', $$testCases.set(testType, $$tests));

    case editorActionTypes.PYTHON_TEST_CASE_UPDATE:
      ({ testType, index, field, newValue } = action);
      $$testCases = $$state.get('test_cases');
      $$tests = $$testCases.get(testType);
      $$tests = $$tests.set(index, $$tests.get(index).set(field, newValue));
      return $$state.set('test_cases', $$testCases.set(testType, $$tests));

    case editorActionTypes.PYTHON_TEST_CASE_DELETE:
      ({ testType, index } = action);
      $$testCases = $$state.get('test_cases');
      $$tests = $$testCases.get(testType).splice(index, 1);
      return $$state.set('test_cases', $$testCases.set(testType, $$tests));

    default:
      return $$state;
  }
}

export default function programmingQuestionReducer($$state = $$initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SKILLS_UPDATE:
    case actionTypes.PROGRAMMING_QUESTION_UPDATE:
      return $$state.set('question', questionReducer($$state.get('question'), action));

    case actionTypes.EDITOR_MODE_UPDATE:
      const { mode } = action;
      return $$state.set('test_ui', $$state.get('test_ui').set('mode', mode));

    case actionTypes.TEMPLATE_TAB_UPDATE:
      const { selected } = action;
      return $$state.set('package_ui', $$state.get('package_ui').set('selected', selected));

    case editorActionTypes.PYTHON_TEST_CASE_CREATE:
    case editorActionTypes.PYTHON_TEST_CASE_UPDATE:
    case editorActionTypes.PYTHON_TEST_CASE_DELETE:
    case editorActionTypes.PYTHON_CODE_BLOCK_UPDATE:
      const $$test = $$state.get('test_ui');
      const $$pythonTest = $$test.get('python');
      return $$state.set('test_ui', $$test.set('python', pythonTestReducer($$pythonTest, action)));

    default:
      return $$state;
  }
}
