import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { SAVING_STATUS } from 'lib/constants/sharedConstants';

import actionTypes from '../../constants';
import translations from '../../translations';
import { buildErrorMessage } from '../utils';

import { dispatchUpdateAnswerFlagSavingStatus } from '.';

export function uploadTextResponseFiles(answerId, answer, resetField) {
  const payload = {
    answer: {
      id: answerId,
      files: answer.files,
    },
  };

  return (dispatch) => {
    dispatch({
      type: actionTypes.UPLOAD_TEXT_RESPONSE_FILES_REQUEST,
      payload: { answerId },
    });
    dispatch(
      dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saving),
    );

    CourseAPI.assessment.answer.textResponse
      .createFiles(answerId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UPLOAD_TEXT_RESPONSE_FILES_SUCCESS,
          payload: data,
        });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saved),
        );
        // files attribute is only a field of text response answer type inside the submission form
        // By default, it is empty, so when the files have been successfully uploaded, revert it to nil
        // In the current case, use resetField
        resetField(`${answerId}.files`);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.UPLOAD_TEXT_RESPONSE_FILES_FAILURE,
          payload: answerId,
        });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Failed),
        );
        resetField(`${answerId}.files`);
        dispatch(
          setNotification(
            translations.importFilesFailure,
            buildErrorMessage(error),
          ),
        );
      });
  };
}

export function deleteTextResponseFile(answerId, questionId, attachmentId) {
  return (dispatch) => {
    const payload = { attachment_id: attachmentId };

    dispatch({
      type: actionTypes.DELETE_ATTACHMENT_REQUEST,
    });
    dispatch(
      dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saving),
    );

    return CourseAPI.assessment.answer.textResponse
      .deleteFile(answerId, payload)
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_ATTACHMENT_SUCCESS,
          payload: {
            answerId,
            questionId,
            attachmentId,
          },
        });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Saved),
        );
      })
      .catch((e) => {
        dispatch({
          type: actionTypes.DELETE_ATTACHMENT_FAILURE,
          payload: { answerId },
        });
        dispatch(
          dispatchUpdateAnswerFlagSavingStatus(answerId, SAVING_STATUS.Failed),
        );
        dispatch(
          setNotification(translations.deleteFileFailure, buildErrorMessage(e)),
        );
      });
  };
}
