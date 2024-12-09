import { Operation } from 'store';
import {
  FolderFormData,
  MaterialFormData,
  MaterialUploadFormData,
} from 'types/course/material/folders';

import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/jobHelpers';

import { actions } from './store';
import { SaveFolderAction } from './types';

const DOWNLOAD_FOLDER_JOB_POLL_INTERVAL_MS = 2000;
const CHUNK_MATERIAL_JOB_POLL_INTERVAL_MS = 1000;

const formatFolderAttributes = (data: FolderFormData): FormData => {
  const payload = new FormData();

  ['name', 'description', 'canStudentUpload', 'startAt', 'endAt'].forEach(
    (field) => {
      if (data[field] !== undefined && data[field] !== null) {
        switch (field) {
          case 'startAt':
            payload.append('material_folder[start_at]', data[field].toString());
            break;
          case 'endAt':
            if (data[field]) {
              payload.append(
                'material_folder[end_at]',
                data[field]!.toString(),
              );
            }
            break;
          case 'canStudentUpload':
            payload.append(
              'material_folder[can_student_upload]',
              `${data[field]}`,
            );
            break;
          default:
            payload.append(`material_folder[${field}]`, data[field]);
            break;
        }
      }
    },
  );
  return payload;
};

const formatMaterialAttributes = (data: MaterialFormData): FormData => {
  const payload = new FormData();

  ['name', 'description'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`material[${field}]`, data[field]);
    }
  });

  if (data.file.file) {
    payload.append('material[file]', data.file.file);
  }
  return payload;
};

export function loadFolder(folderId?: number): Operation<SaveFolderAction> {
  return async (dispatch) =>
    CourseAPI.folders.fetch(folderId).then((response) => {
      const data = response.data;
      return dispatch(
        actions.saveFolder(
          data.currFolderInfo,
          data.subfolders,
          data.materials,
          data.advanceStartAt,
          data.permissions,
        ),
      );
    });
}

export function createFolder(
  formData: FolderFormData,
  folderId: number,
): Operation {
  const attributes = formatFolderAttributes(formData);
  attributes.append('material_folder[parent_id]', `${folderId}`);
  return async (dispatch) =>
    CourseAPI.folders.createFolder(folderId, attributes).then((response) => {
      const data = response.data;
      dispatch(
        actions.saveFolder(
          data.currFolderInfo,
          data.subfolders,
          data.materials,
          data.advanceStartAt,
          data.permissions,
        ),
      );
    });
}

export function updateFolder(
  formData: FolderFormData,
  folderId: number,
): Operation {
  const attributes = formatFolderAttributes(formData);
  return async (dispatch) =>
    CourseAPI.folders.updateFolder(folderId, attributes).then((response) => {
      const data = response.data;
      dispatch(
        actions.saveFolder(
          data.currFolderInfo,
          data.subfolders,
          data.materials,
          data.advanceStartAt,
          data.permissions,
        ),
      );
    });
}

export function deleteFolder(folderId: number): Operation {
  return async (dispatch) =>
    CourseAPI.folders.deleteFolder(folderId).then(() => {
      dispatch(actions.deleteFolderList(folderId));
    });
}

function formatMaterialUploadAttributes(
  data: MaterialUploadFormData,
): FormData {
  const payload = new FormData();

  ['files'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'files':
          data[field].forEach((file): void => {
            payload.append('material_folder[files_attributes][]', file);
          });
          break;
        default:
          payload.append(`material_folder[${field}]`, data[field]);
          break;
      }
    }
  });
  payload.append('render_show', 'true');
  return payload;
}

export function uploadMaterials(
  formData: MaterialUploadFormData,
  currFolderId: number,
): Operation {
  const attributes = formatMaterialUploadAttributes(formData);
  return async (dispatch) =>
    CourseAPI.folders
      .uploadMaterials(currFolderId, attributes)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveFolder(
            data.currFolderInfo,
            data.subfolders,
            data.materials,
            data.advanceStartAt,
            data.permissions,
          ),
        );
      });
}

export function deleteMaterial(
  currFolderId: number,
  materialId: number,
): Operation {
  return async (dispatch) =>
    CourseAPI.folders.deleteMaterial(currFolderId, materialId).then(() => {
      dispatch(actions.deleteMaterialList(materialId));
    });
}

export function removeChunks(
  currFolderId: number,
  materialId: number,
): Operation {
  return async (dispatch) =>
    CourseAPI.folders
      .deleteMaterialChunks(currFolderId, materialId)
      .then(() => {
        dispatch(
          actions.updateMaterialWorkflowStateList(materialId, 'not_chunked'),
        );
      });
}

export function chunkMaterial(
  currFolderId: number,
  materialId: number,
  handleSuccess: () => void,
  handleFailure: () => void,
): Operation {
  return async (dispatch) => {
    // Dispatch initial update to set workflow state to 'chunking'
    dispatch(actions.updateMaterialWorkflowStateList(materialId, 'chunking'));
    CourseAPI.folders
      .chunkMaterial(currFolderId, materialId)
      .then((response) => {
        const jobUrl = response.data.jobUrl;
        pollJob(
          jobUrl,
          () => {
            dispatch(
              actions.updateMaterialWorkflowStateList(materialId, 'chunked'),
            );
            handleSuccess();
          },
          () => {
            dispatch(
              actions.updateMaterialWorkflowStateList(
                materialId,
                'not_chunked',
              ),
            );
            handleFailure();
          },
          CHUNK_MATERIAL_JOB_POLL_INTERVAL_MS,
        );
      })
      .catch(handleFailure);
  };
}

export function updateMaterial(
  formData: MaterialFormData,
  folderId: number,
  materialId: number,
): Operation {
  const attributes = formatMaterialAttributes(formData);
  return async (dispatch) =>
    CourseAPI.folders
      .updateMaterial(folderId, materialId, attributes)
      .then((response) => {
        const data = response.data;
        dispatch(actions.saveMaterialList(data));
      });
}

export function downloadFolder(
  currFolderId: number,
  handleSuccess: () => void,
  handleFailure: () => void,
): Operation {
  return async () =>
    CourseAPI.folders
      .downloadFolder(currFolderId)
      .then((response) => {
        pollJob(
          response.data.jobUrl,
          (data) => {
            handleSuccess();
            if (data.redirectUrl) window.location.href = data.redirectUrl;
          },
          handleFailure,
          DOWNLOAD_FOLDER_JOB_POLL_INTERVAL_MS,
        );
      })
      .catch(handleFailure);
}
