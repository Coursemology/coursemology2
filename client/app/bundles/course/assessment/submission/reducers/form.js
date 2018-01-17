import { reducer as formReducer } from 'redux-form';

import actions, { formNames } from '../constants';

// Extract redux-form values from JSON response
function buildInitialValues(answers) {
  return answers.reduce((obj, answer) => ({
    ...obj,
    [answer.fields.id]: answer.fields,
  }), {});
}

// Return a new state slice with the new answer replacing its
// previous answer of the same question
function updateAnswerInState(state, answer) {
  const { questionId, fields: { id } } = answer;
  return Object.keys(state).reduce((obj, key) => {
    if (state[key].questionId !== questionId) {
      return { ...obj, [key]: state[key] };
    }
    return obj;
  }, { [id]: answer.fields });
}

function removeProgrammingFileFromState(state, questionId, fileId) {
  return Object.keys(state).reduce((obj, key) => {
    if (state[key].questionId !== questionId) {
      return { ...obj, [key]: state[key] };
    }
    return {
      ...obj,
      [key]: {
        ...state[key],
        files_attributes: state[key].files_attributes.reduce((acc, file) => {
          if (file.id !== fileId) {
            return acc.concat(file);
          }
          return acc;
        }, []),
      },
    };
  }, {});
}

export default formReducer.plugin({
  [formNames.SUBMISSION]: (state, action) => {
    switch (action.type) {
      case actions.FETCH_SUBMISSION_SUCCESS:
      case actions.SAVE_DRAFT_SUCCESS:
      case actions.FINALISE_SUCCESS:
      case actions.UNSUBMIT_SUCCESS:
      case actions.SAVE_GRADE_SUCCESS:
      case actions.MARK_SUCCESS:
      case actions.UNMARK_SUCCESS:
      case actions.PUBLISH_SUCCESS: {
        const formValues = buildInitialValues(action.payload.answers);

        return {
          ...state,
          initial: formValues,
          values: formValues,
        };
      }
      case actions.IMPORT_FILES_SUCCESS:
      case actions.AUTOGRADE_SUCCESS:
      case actions.RESET_SUCCESS: {
        const answer = action.payload;

        return {
          ...state,
          initial: updateAnswerInState(state.initial, answer),
          values: updateAnswerInState(state.values, answer),
        };
      }
      case actions.DELETE_FILE_SUCCESS: {
        const { questionId, answer: { fileId } } = action.payload;
        return {
          ...state,
          initial: removeProgrammingFileFromState(state.initial, questionId, fileId),
          values: removeProgrammingFileFromState(state.values, questionId, fileId),
        };
      }
      case actions.STAGE_FILES: {
        const { answerId, files } = action;
        const newFiles = Object(files).reduce((acc, obj) => {
          const file = { filename: obj.name, staged: true };
          const fr = new FileReader();
          fr.onload = (e) => {
            file.content = e.target.result;
          };
          fr.readAsText(obj);
          return acc.concat(file);
        }, []);

        // Removes previously staged files
        const filteredFiles = state.values[answerId].files_attributes.filter(file => !file.staged);

        return {
          ...state,
          values: {
            ...state.values,
            [answerId]: {
              ...state.values[answerId],
              files_attributes: filteredFiles.concat(newFiles),
            },
          },
        };
      }
      default:
        return state;
    }
  },
});
