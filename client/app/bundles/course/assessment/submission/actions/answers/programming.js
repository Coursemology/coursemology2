import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { MAX_SAVING_SIZE, SAVING_STATUS } from 'lib/constants/sharedConstants';
import toast from 'lib/hooks/toast';

import actionTypes from '../../constants';
import translations from '../../translations';
import { convertAnswerDataToInitialValue } from '../../utils/answers';
import { buildErrorMessage } from '../utils';

import {
  dispatchUpdateAnswerFlagSavingSize,
  dispatchUpdateAnswerFlagSavingStatus,
} from '.';

// Ensure that there are no existing files with the same filenames
const validateUniqueFilenames = (files) => {
  const filenames = files.map((file) => file.filename);
  const uniqueFilenames = filenames.filter(
    (name, index, self) => self.indexOf(name) === index,
  );
  return filenames.length === uniqueFilenames.length;
};

const validateFilesByLanguageMap = {
  java: (files) => {
    // Used to ensure that only java files can be uploaded.
    const regex = /\.(java)$/i;
    return (
      files.filter((file) => regex.test(file.filename)).length === files.length
    );
  },
};

const validateFilesByLanguageErrorMessageMap = {
  java: translations.invalidJavaFileUpload,
};

const validateProgrammingFilesErrorMsg = (language, files) => {
  if (!validateUniqueFilenames(files)) {
    return translations.similarFileNameExists;
  }
  const specificLanguageValidator = validateFilesByLanguageMap[language];
  if (specificLanguageValidator && !specificLanguageValidator(files)) {
    return validateFilesByLanguageErrorMessageMap[language];
  }
  return null;
};

export function importProgrammingFiles(answerId, files, language, resetField) {
  const savingSize = files.reduce(
    (acc, file) => acc + (file?.content?.length ?? 0),
    0,
  );
  if (savingSize > MAX_SAVING_SIZE) {
    return (dispatch) => {
      dispatch(dispatchUpdateAnswerFlagSavingSize(answerId, savingSize));
      dispatch(
        dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Failed),
      );
      resetField(`${answerId}.import_files`, {
        defaultValue: null,
      });
      dispatch(setNotification(translations.answerTooLargeError));
    };
  }
  const filesPayload = files.map((file) => ({
    id: file.id,
    filename: file.filename,
    content: file.content,
  }));
  const payload = {
    answer: {
      id: answerId,
      files_attributes: filesPayload,
    },
  };

  return (dispatch) => {
    dispatch(dispatchUpdateAnswerFlagSavingSize(answerId, savingSize));
    dispatch({
      type: actionTypes.UPLOAD_PROGRAMMING_FILES_REQUEST,
      payload: { answerId },
    });
    dispatch(
      dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saving),
    );

    const validationErrorMessage = validateProgrammingFilesErrorMsg(
      language,
      filesPayload,
    );

    if (validationErrorMessage) {
      dispatch({
        type: actionTypes.UPLOAD_PROGRAMMING_FILES_FAILURE,
      });
      resetField(`${answerId}.import_files`, {
        defaultValue: null,
      });
      dispatch(
        dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Failed),
      );
      dispatch(setNotification(validationErrorMessage));
      return;
    }

    CourseAPI.assessment.answer.programming
      .createProgrammingFiles(answerId, payload)
      .then((response) => {
        const updatedAnswer = response.data;
        dispatch({
          type: actionTypes.UPLOAD_PROGRAMMING_FILES_SUCCESS,
          payload: updatedAnswer,
        });
        resetField(`${answerId}`, {
          defaultValue: convertAnswerDataToInitialValue(updatedAnswer),
        });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saved),
        );
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.UPLOAD_PROGRAMMING_FILES_FAILURE,
        });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(
            answerId,
            SAVING_STATUS.Failed,
            false,
          ),
        );
        resetField(`${answerId}.import_files`, {
          defaultValue: null,
        });
        toast.error(buildErrorMessage(error));
      });
  };
}

export function deleteProgrammingFile(answer, fileId, onDeleteSuccess) {
  const answerId = answer.id;
  const payload = {
    answer: { id: answerId, file_id: fileId },
  };

  return (dispatch) => {
    dispatch({
      type: actionTypes.DELETE_PROGRAMMING_FILE_REQUEST,
      payload: { answerId: payload.answer.id },
    });
    dispatch(
      dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saving),
    );

    return CourseAPI.assessment.answer.programming
      .deleteProgrammingFile(answerId, payload)
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_PROGRAMMING_FILE_SUCCESS,
        });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saved),
        );
        onDeleteSuccess();
        dispatch(setNotification(translations.deleteFileSuccess));
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.DELETE_PROGRAMMING_FILE_FAILURE,
        });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Failed),
        );
        dispatch(
          setNotification(
            translations.deleteFileFailure,
            buildErrorMessage(error),
          ),
        );
      });
  };
}
