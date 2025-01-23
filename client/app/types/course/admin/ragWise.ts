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
