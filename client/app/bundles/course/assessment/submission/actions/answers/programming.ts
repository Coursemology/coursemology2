import { ComponentProps, createElement, ReactElement, ReactNode } from 'react';
import { FieldValues, UseFormResetField } from 'react-hook-form';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { AxiosError } from 'axios';
import { Operation } from 'store';
import { ProgrammingFilePostData } from 'types/course/assessment/submission/answer/programming';

import CourseAPI from 'api/course';
import {
  validatePath,
  validatePaths,
} from 'course/assessment/components/FileTreeManager/paths';
import fileTreeTranslations from 'course/assessment/components/FileTreeManager/translations';
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

// These actions report through toasts, red for errors and green for success, as the rest of the
// site does. Toasts render inside the intl provider, so one can carry a message to translate.
const message = (
  descriptor: MessageDescriptor,
  values?: ComponentProps<typeof FormattedMessage>['values'],
): ReactElement => createElement(FormattedMessage, { ...descriptor, values });

// The server names why an upload failed in `codes`, which are turned into messages here; any other
// failure shows the server's own error text.
const UPLOAD_ERROR_MESSAGES: Record<string, MessageDescriptor> = {
  binary: translations.binaryFileUploadError,
};

const uploadErrorMessage = (error: unknown): ReactNode => {
  const codes =
    (error as AxiosError<{ codes?: string[] }>)?.response?.data?.codes ?? [];
  const known = codes.find((code) => UPLOAD_ERROR_MESSAGES[code]);
  return known
    ? message(UPLOAD_ERROR_MESSAGES[known])
    : buildErrorMessage(error);
};

// The files not saved yet (with no id) need valid paths that don't clash with each other or with
// the saved files, ignoring case as the server does. Clashes among saved files alone are left alone.
const pathsErrorMsg = (
  files: ProgrammingFilePostData[],
): MessageDescriptor | null => {
  const added = files.filter((file) => !file.id).map((file) => file.filename);
  const saved = files.filter((file) => file.id).map((file) => file.filename);

  const pathErrors = added.map(validatePath);
  if (pathErrors.includes('tooLong')) return fileTreeTranslations.pathTooLong;
  if (pathErrors.includes('invalid')) return fileTreeTranslations.invalidPath;
  if (validatePaths(added, saved)) return translations.similarFileNameExists;
  return null;
};

const validateFilesByLanguageMap: Record<
  string,
  (files: ProgrammingFilePostData[]) => boolean
> = {
  java: (files) => {
    // Used to ensure that only java files can be uploaded.
    const regex = /\.(java)$/i;
    return (
      files.filter((file) => regex.test(file.filename)).length === files.length
    );
  },
};

const validateFilesByLanguageErrorMessageMap: Record<
  string,
  MessageDescriptor
> = {
  java: translations.invalidJavaFileUpload,
};

const validateProgrammingFilesErrorMsg = (
  language: string,
  files: ProgrammingFilePostData[],
): MessageDescriptor | null => {
  const pathsError = pathsErrorMsg(files);
  if (pathsError) return pathsError;

  const specificLanguageValidator = validateFilesByLanguageMap[language];
  if (specificLanguageValidator && !specificLanguageValidator(files)) {
    return validateFilesByLanguageErrorMessageMap[language];
  }
  return null;
};

/**
 * Saves an answer's files: its saved files, by `id`, and the new ones. The answer in the form is
 * replaced with the saved one, and failures are reported in a toast.
 *
 * @returns The save, so the caller can wait for it. It resolves after a failure too.
 */
export function importProgrammingFiles(
  answerId: number,
  files: ProgrammingFilePostData[],
  language: string,
  resetField: UseFormResetField<FieldValues>,
): Operation {
  const savingSize = files.reduce(
    (acc, file) => acc + (file?.content?.length ?? 0),
    0,
  );
  if (savingSize > MAX_SAVING_SIZE) {
    return async (dispatch) => {
      dispatch(dispatchUpdateAnswerFlagSavingSize(answerId, savingSize));
      dispatch(
        dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Failed),
      );
      resetField(`${answerId}.import_files`, {
        defaultValue: null,
      });
      toast.error(message(translations.answerTooLargeError));
    };
  }
  const filesPayload = files.map(
    (file): ProgrammingFilePostData => ({
      id: file.id,
      filename: file.filename,
      content: file.content,
    }),
  );
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
      toast.error(message(validationErrorMessage));
      return Promise.resolve();
    }

    // Returned so the caller can wait for the save; failures are reported here.
    return CourseAPI.assessment.answer.programming
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
        toast.success(
          message(translations.uploadFilesSuccess, {
            count: filesPayload.filter((file) => !file.id).length,
          }),
        );
      })
      .catch((error: unknown) => {
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
        toast.error(uploadErrorMessage(error));
      });
  };
}

export function deleteProgrammingFile(
  answer: { id: number },
  fileId: number,
  onDeleteSuccess: () => void,
): Operation {
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
        toast.success(message(translations.deleteFileSuccess));
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.DELETE_PROGRAMMING_FILE_FAILURE,
        });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Failed),
        );
        toast.error(
          message(translations.deleteFileFailure, {
            errors: buildErrorMessage(error),
          }),
        );
      });
  };
}
