import Immutable from 'immutable';

import actionTypes from '../constants/programmingQuestionConstants';
import editorActionTypes from '../constants/onlineEditorConstants';

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
      data_files: [],
    },
    data_files: {
      to_delete: Immutable.Set(),
      new: [
        { key: 0, filename: null },
      ],
      key: 0,
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

function pythonTestReducer(state, action) {
  const { type } = action;

  switch (type) {
    case editorActionTypes.PYTHON_CODE_BLOCK_UPDATE: {
      const { field, newValue } = action;
      return state.set(field, newValue);
    }
    case editorActionTypes.PYTHON_TEST_CASE_CREATE: {
      const { testType } = action;
      const newTest = {
        expression: '',
        expected: '',
        hint: '',
      };
      const tests = state.get('test_cases').get(testType).push(Immutable.fromJS(newTest));
      return state
        .setIn(['test_cases', testType], tests)
        .deleteIn(['test_cases', 'error']);
    }
    case editorActionTypes.PYTHON_TEST_CASE_UPDATE: {
      const { testType, index, field, newValue } = action;
      return state
        .setIn(['test_cases', testType, index, field], newValue)
        .deleteIn(['test_cases', testType, index, 'error']);
    }
    case editorActionTypes.PYTHON_TEST_CASE_DELETE: {
      const { testType, index } = action;
      const tests = state.get('test_cases').get(testType).splice(index, 1);
      return state.setIn(['test_cases', testType], tests);
    }
    default: {
      return state;
    }
  }
}

function dataFilesReducer(state, action) {
  const { type } = action;

  switch (type) {
    case editorActionTypes.PYTHON_NEW_DATA_FILE_UPDATE: {
      const { index, filename } = action;
      let newFiles = state.get('new')
        .update(index, fileData => Immutable.fromJS({ key: fileData.get('key'), filename }));

      // Adds a new entry if there are no more empty non-deleted files.
      if (newFiles.last().get('filename') !== null) {
        const newKey = state.get('new') + 1;
        newFiles = newFiles.push(Immutable.fromJS({ key: newKey, filename: null }));
        return state.set('key', newKey).set('new', newFiles);
      }

      return state.set('new', newFiles);
    }
    case editorActionTypes.PYTHON_NEW_DATA_FILE_DELETE: {
      const { index } = action;
      return state.set('new', state.get('new').delete(index));
    }
    case editorActionTypes.PYTHON_EXISTING_DATA_FILE_DELETE: {
      const { filename, toDelete } = action;
      const currentFilesToDelete = state.get('to_delete');

      if (toDelete) {
        return state.set('to_delete', currentFilesToDelete.add(filename));
      }

      return state.set('to_delete', currentFilesToDelete.delete(filename));
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
        const key = state.getIn(['test_ui', 'data_files', 'key']);
        let newState = state;
        const editorMode = test_ui.mode;

        if (editorMode && test_ui[editorMode] !== undefined) {
          newState = newState.setIn(['test_ui', editorMode], Immutable.fromJS(test_ui[editorMode]));
        }

        return newState
          .set('is_evaluating', isEvaluating)
          .mergeDeep({ question })
          .setIn(['question', 'package_filename'], null)
          .merge({ package_ui, import_result })
          .setIn(['test_ui', 'data_files', 'to_delete'], Immutable.Set())
          .setIn(['test_ui', 'data_files', 'new'], Immutable.fromJS([{ key, filename: null }]));
      }

      return state
        .set('is_evaluating', isEvaluating)
        .mergeIn(['import_result'], { alert: null, build_log: null });
    }
    case actionTypes.SUBMIT_FORM_SUCCESS: {
      const { data } = action;
      const { question, package_ui, test_ui, import_result } = data;
      let newState = state;
      const editorMode = test_ui.mode;

      if (editorMode && test_ui[editorMode] !== undefined) {
        newState = newState.setIn(['test_ui', editorMode], Immutable.fromJS(test_ui[editorMode]));
      }

      return newState
        .mergeDeep({ question })
        .merge({ package_ui, import_result });
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
    case editorActionTypes.PYTHON_TEST_CASE_CREATE:
    case editorActionTypes.PYTHON_TEST_CASE_UPDATE:
    case editorActionTypes.PYTHON_TEST_CASE_DELETE:
    case editorActionTypes.PYTHON_CODE_BLOCK_UPDATE: {
      const pythonTest = state.get('test_ui').get('python');
      return state.setIn(['test_ui', 'python'], pythonTestReducer(pythonTest, action));
    }
    case editorActionTypes.PYTHON_NEW_DATA_FILE_UPDATE:
    case editorActionTypes.PYTHON_NEW_DATA_FILE_DELETE:
    case editorActionTypes.PYTHON_EXISTING_DATA_FILE_DELETE: {
      const dataFiles = state.get('test_ui').get('data_files');
      return state.setIn(['test_ui', 'data_files'], dataFilesReducer(dataFiles, action));
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
