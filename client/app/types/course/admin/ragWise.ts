import { FORUM_IMPORT_WORKFLOW_STATE } from 'course/admin/pages/RagWiseSettings/constants';
import { MATERIAL_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

export interface RagWiseSettings {
  responseWorkflow: string;
  roleplay: string;
}

export interface RagWiseSettingsPostData {
  settings_rag_wise_component: {
    response_workflow: RagWiseSettings['responseWorkflow'];
    roleplay: RagWiseSettings['roleplay'];
  };
}

export interface ForumImportData {
  forum_imports: {
    forum_ids: number[];
  };
}

export interface Material {
  id: number;
  folderId: number;
  name: string;
  folderName: string;
  workflowState: keyof typeof MATERIAL_WORKFLOW_STATE;
  materialUrl: string;
}

export interface Folder {
  id: number;
  parentId: number;
  name: string;
}

export interface Course {
  id: number;
  name: string;
  canManageCourse: boolean;
}

export interface ForumImport {
  id: number;
  name: string;
  courseId: number;
  workflowState: keyof typeof FORUM_IMPORT_WORKFLOW_STATE;
}
