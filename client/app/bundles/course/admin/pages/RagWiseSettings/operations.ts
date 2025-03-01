import { AxiosError } from 'axios';
import { dispatch, Operation } from 'store';
import {
  Course,
  Folder,
  ForumImport,
  ForumImportData,
  Material,
  RagWiseSettings,
  RagWiseSettingsPostData,
} from 'types/course/admin/ragWise';

import CourseAPI from 'api/course';
import {
  saveAllCourses,
  saveAllFolders,
  saveAllForums,
  saveAllMaterials,
  updateForumImportsWorkflowState,
  updateMaterialsWorkflowState,
} from 'course/admin/reducers/ragWiseSettings';
import { MATERIAL_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import pollJob from 'lib/helpers/jobHelpers';

import { FORUM_IMPORT_WORKFLOW_STATE } from './constants';

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

export const fetchAllCourses = async (): Promise<Course[]> => {
  try {
    const response = await CourseAPI.admin.ragWise.courses();
    dispatch(saveAllCourses({ courses: response.data.courses }));
    return response.data.courses;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const fetchAllForums = async (): Promise<ForumImport[]> => {
  try {
    const response = await CourseAPI.admin.ragWise.forums();
    dispatch(saveAllForums({ forums: response.data.forums }));
    return response.data.forums;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export function removeChunks(materialIds: number[]): Operation {
  return async () => {
    await CourseAPI.materials.deleteMaterialChunks({
      material: {
        material_ids: materialIds,
      },
    });
    dispatch(
      updateMaterialsWorkflowState({
        ids: materialIds,
        workflowState: MATERIAL_WORKFLOW_STATE.not_chunked,
      }),
    );
  };
}

export function chunkMaterial(
  materialIds: number[],
  handleSuccess: () => void,
  handleFailure: () => void,
): Operation {
  return async () => {
    const updateState = (state: keyof typeof MATERIAL_WORKFLOW_STATE): void => {
      dispatch(
        updateMaterialsWorkflowState({
          ids: materialIds,
          workflowState: state,
        }),
      );
    };

    updateState(MATERIAL_WORKFLOW_STATE.chunking);

    const data = {
      material: {
        material_ids: materialIds,
      },
    };

    try {
      const response = await CourseAPI.materials.chunkMaterials(data);
      const jobUrl = response.data.jobUrl;

      pollJob(
        jobUrl,
        () => {
          updateState(MATERIAL_WORKFLOW_STATE.chunked);
          handleSuccess();
        },
        () => {
          updateState(MATERIAL_WORKFLOW_STATE.not_chunked);
          handleFailure();
        },
        CHUNK_MATERIAL_JOB_POLL_INTERVAL_MS,
      );
    } catch {
      updateState(MATERIAL_WORKFLOW_STATE.not_chunked);
      handleFailure();
    }
  };
}

export function importForum(
  forumImportIds: number[],
  handleSuccess: () => void,
  handleFailure: () => void,
): Operation {
  return async () => {
    const updateState = (
      state: keyof typeof FORUM_IMPORT_WORKFLOW_STATE,
    ): void => {
      dispatch(
        updateForumImportsWorkflowState({
          ids: forumImportIds,
          workflowState: state,
        }),
      );
    };

    updateState(FORUM_IMPORT_WORKFLOW_STATE.importing);

    const data: ForumImportData = {
      forum_imports: {
        forum_ids: forumImportIds,
      },
    };

    try {
      const response = await CourseAPI.admin.ragWise.importCourseForums(data);
      const jobUrl = response.data.jobUrl;

      pollJob(
        jobUrl,
        () => {
          updateState(FORUM_IMPORT_WORKFLOW_STATE.imported);
          handleSuccess();
        },
        () => {
          updateState(FORUM_IMPORT_WORKFLOW_STATE.not_imported);
          handleFailure();
        },
        CHUNK_MATERIAL_JOB_POLL_INTERVAL_MS,
      );
    } catch {
      updateState(FORUM_IMPORT_WORKFLOW_STATE.not_imported);
      handleFailure();
    }
  };
}

export function destroyImportedDiscussions(forumImportId: number[]): Operation {
  return async () => {
    const data: ForumImportData = {
      forum_imports: {
        forum_ids: forumImportId,
      },
    };
    await CourseAPI.admin.ragWise.destroyImportedDiscussions(data);
    dispatch(
      updateForumImportsWorkflowState({
        ids: forumImportId,
        workflowState: FORUM_IMPORT_WORKFLOW_STATE.not_imported,
      }),
    );
  };
}
