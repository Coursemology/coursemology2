import { AxiosError } from 'axios';
import { dispatch, Operation } from 'store';
import {
  Folder,
  Material,
  RagWiseSettings,
  RagWiseSettingsPostData,
} from 'types/course/admin/ragWise';

import CourseAPI from 'api/course';
import {
  saveAllFolders,
  saveAllMaterials,
  updateMaterialWorkflowState,
} from 'course/admin/reducers/ragWiseSettings';
import { MATERIAL_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import pollJob from 'lib/helpers/jobHelpers';

const CHUNK_MATERIAL_JOB_POLL_INTERVAL_MS = 2000;

type Data = Promise<RagWiseSettings>;

export const fetchRagWiseSettings = async (): Data => {
  const response = await CourseAPI.admin.ragWise.index();
  return response.data;
};

export const updateRagWiseSettings = async (data: RagWiseSettings): Data => {
  const adaptedData: RagWiseSettingsPostData = {
    settings_rag_wise_component: {
      response_workflow: data.responseWorkflow,
      roleplay: data.roleplay,
    },
  };

  try {
    const response = await CourseAPI.admin.ragWise.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const fetchAllMaterials = async (): Promise<Material[]> => {
  try {
    const response = await CourseAPI.admin.ragWise.materials();
    dispatch(saveAllMaterials({ materials: response.data.materials }));
    return response.data.materials;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const fetchAllFolders = async (): Promise<Folder[]> => {
  try {
    const response = await CourseAPI.admin.ragWise.folders();
    dispatch(saveAllFolders({ folders: response.data.folders }));
    return response.data.folders;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export function removeChunks(
  currFolderId: number,
  materialId: number,
): Operation {
  return async () => {
    await CourseAPI.folders.deleteMaterialChunks(currFolderId, materialId);
    dispatch(
      updateMaterialWorkflowState({
        id: materialId,
        workflowState: MATERIAL_WORKFLOW_STATE.not_chunked,
      }),
    );
  };
}

export function chunkMaterial(
  currFolderId: number,
  materialId: number,
  handleSuccess: () => void,
  handleFailure: () => void,
): Operation {
  return async () => {
    CourseAPI.folders
      .chunkMaterial(currFolderId, materialId)
      .then((response) => {
        const jobUrl = response.data.jobUrl;
        dispatch(
          updateMaterialWorkflowState({
            id: materialId,
            workflowState: MATERIAL_WORKFLOW_STATE.chunking,
          }),
        );
        pollJob(
          jobUrl,
          () => {
            dispatch(
              updateMaterialWorkflowState({
                id: materialId,
                workflowState: MATERIAL_WORKFLOW_STATE.chunked,
              }),
            );
            handleSuccess();
          },
          () => {
            dispatch(
              updateMaterialWorkflowState({
                id: materialId,
                workflowState: MATERIAL_WORKFLOW_STATE.not_chunked,
              }),
            );
            handleFailure();
          },
          CHUNK_MATERIAL_JOB_POLL_INTERVAL_MS,
        );
      })
      .catch(handleFailure);
  };
}
