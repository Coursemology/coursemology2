/* eslint-disable camelcase */
import Immutable from 'immutable';

import { javaAppend, cppAppend, editorActionTypes, actionTypes } from '../constants';

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
    autograded: false,
    display_autograded_toggle: false,
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
    c_cpp: {
      prepend: '',
      append: cppAppend,
      solution: '',
      submission: '',
      test_cases: {
        evaluation: [],
        private: [],
        public: [],
      },
      data_files: [],
    },
    java: {
      prepend: '',
      append: javaAppend,
      solution: '',
      submission: '',
      submit_as_file: false,
      solution_files: [],
      submission_files: [],
      test_cases: {
        evaluation: [],
        private: [],
        public: [],
      },
      data_files: [],
    },
    solution_files: {
      to_delete: Immutable.Set(),
      new: [
        { key: 0, filename: null },
      ],
      key: 0,
    },
    submission_files: {
      to_delete: Immutable.Set(),
      new: [
        { key: 0, filename: null },
      ],
      key: 0,
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
  },
});

function apiReducer(state, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SUBMIT_FORM_LOADING: {
      const { isLoading } = action;
      return state.set('is_loading', isLoading).delete('save_errors');
    }
    case actionTypes.SUBMIT_FORM_EVALUATING: {
      const { isEvaluating, data } = action;

      if (isEvaluating) {
        // Evaluation started
        return state
          .set('is_evaluating', isEvaluating)
          .mergeIn(['import_result'], { alert: null, build_log: null });
      }

      if (data) {
        // Evaluation has completed, updated data retrieved from server.
        const { form_data, question, package_ui, test_ui, import_result } = data;
        const key = state.getIn(['test_ui', 'data_files', 'key']);
        const submissionKey = state.getIn(['test_ui', 'submission_files', 'key']);
        const solutionKey = state.getIn(['test_ui', 'solution_files', 'key']);
        const editorMode = test_ui.mode;
        const autogradedInClient = state.getIn(['question', 'autograded']);
        const newState = state
          .set('is_evaluating', isEvaluating)
          .mergeDeep({ question })
          .setIn(['question', 'package_filename'], null)
          .merge({ form_data, package_ui, import_result })
          .setIn(['test_ui', 'data_files', 'new'], Immutable.fromJS([{ key, filename: null }]))
          .setIn(['test_ui', 'submission_files', 'new'], Immutable.fromJS([{ key: submissionKey, filename: null }]))
          .setIn(['test_ui', 'solution_files', 'new'], Immutable.fromJS([{ key: solutionKey, filename: null }]));

        if (import_result.import_errored) {
          const packagePathInClient = state.getIn(['question', 'package', 'path']);
          const packagePathFromServer = question.package ? question.package.path : undefined;

          if (packagePathInClient !== packagePathFromServer) {
            // the old package has been changed, set to what the server returned
            return newState
              .setIn(['test_ui', 'mode'], editorMode)
              .setIn(['test_ui', editorMode], Immutable.fromJS(test_ui[editorMode]))
              .setIn(['test_ui', 'data_files', 'to_delete'], Immutable.Set())
              .setIn(['test_ui', 'submission_files', 'to_delete'], Immutable.Set())
              .setIn(['test_ui', 'solution_files', 'to_delete'], Immutable.Set());
          }

          // still the same old package, the client state shall be preserved
          return newState.setIn(['question', 'autograded'], autogradedInClient);
        }

        // Evaluation completed successfully
        return newState
          .setIn(['test_ui', 'mode'], editorMode)
          .setIn(['test_ui', editorMode], Immutable.fromJS(test_ui[editorMode]))
          .setIn(['test_ui', 'data_files', 'to_delete'], Immutable.Set())
          .setIn(['test_ui', 'submission_files', 'to_delete'], Immutable.Set())
          .setIn(['test_ui', 'solution_files', 'to_delete'], Immutable.Set());
      }

      // Evaluation ended without any data retrieved from server
      return state
        .set('is_evaluating', isEvaluating);
    }
    case actionTypes.SUBMIT_FORM_SUCCESS: {
      const { data } = action;
      const { form_data, question, test_ui } = data;
      let newState = state;
      const editorMode = test_ui.mode;

      if (editorMode && test_ui[editorMode] !== undefined) {
        newState = newState.setIn(['test_ui', editorMode], Immutable.fromJS(test_ui[editorMode]));
      }

      return newState
        .mergeDeep({ question })
        .merge({ form_data });
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
    case editorActionTypes.TOGGLE_SUBMIT_AS_FILE:
    case editorActionTypes.TEST_CASE_CREATE:
    case editorActionTypes.TEST_CASE_UPDATE:
    case editorActionTypes.TEST_CASE_DELETE:
    case editorActionTypes.CODE_BLOCK_UPDATE: {
      const mode = state.get('test_ui').get('mode');
      const test = state.get('test_ui').get(mode);
      return state.setIn(['test_ui', mode], testReducer(test, action));
    }
    case editorActionTypes.NEW_PACKAGE_FILE_UPDATE:
    case editorActionTypes.NEW_PACKAGE_FILE_DELETE:
    case editorActionTypes.EXISTING_PACKAGE_FILE_DELETE: {
      const { fileType } = action;
      const packageFiles = state.get('test_ui').get(fileType);
      return state.setIn(['test_ui', fileType], packageFilesReducer(packageFiles, action));
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
