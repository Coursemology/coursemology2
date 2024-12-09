import { Permissions } from 'types';

import {
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
} from '../courseUsers';

// Permissions for rendering title bar buttons
export type FolderPermissions = Permissions<
  | 'canManageKnowledgeBase'
  | 'isCurrentCourseStudent'
  | 'canStudentUpload'
  | 'canCreateSubfolder'
  | 'canUpload'
  | 'canEdit'
>;

export type SubfolderPermissions = Permissions<
  | 'canStudentUpload'
  | 'showSdlWarning'
  | 'canEdit'
  | 'canDelete'
  | 'canManageKnowledgeBase'
>;

export type MaterialPermissions = Permissions<'canEdit' | 'canDelete'>;

export type MaterialWorkflowState = 'not_chunked' | 'chunking' | 'chunked';

export interface FolderListData {
  id: number;
  name: string;
  description: string;
  materialUrl: string;
  itemCount: number;
  updatedAt: string;
  startAt: string;
  endAt: string | null;
  effectiveStartAt: string;
  permissions: SubfolderPermissions;
}

export interface MaterialListData {
  id: number;
  name: string;
  description: string;
  materialUrl: string;
  updatedAt: string;
  updater: CourseUserBasicListData;
  permissions: MaterialPermissions;
  workflowState: MaterialWorkflowState;
}

export interface FolderMiniEntity {
  id: number;
  name: string;
  description: string;
  itemCount: number;
  updatedAt: string;
  startAt: string;
  endAt: string | null;
  effectiveStartAt: string;
  permissions: SubfolderPermissions;
}

export interface MaterialMiniEntity {
  id: number;
  name: string;
  description: string;
  materialUrl: string;
  updatedAt: string;
  updater: CourseUserBasicMiniEntity;
  permissions: MaterialPermissions;
  workflowState: MaterialWorkflowState;
}

export interface FolderData {
  currFolderInfo: {
    id: number;
    parentId: number | null;
    name: string;
    description: string;
    isConcrete: boolean;
    startAt: string;
    endAt: string | null;
    workflowState: MaterialWorkflowState;
  };
  subfolders: FolderListData[];
  materials: MaterialListData[];
  breadcrumbs: { id: number; name: string }[];
  advanceStartAt: number;
  permissions: FolderPermissions;
}

export interface FolderFormData {
  name: string;
  description: string;
  canStudentUpload: boolean;
  startAt: Date;
  endAt: Date | null;
}

export interface MaterialUploadFormData {
  files: File[];
}

export interface MaterialFormData {
  name: string;
  description: string;
  file: { name: string; url: string; file?: Blob };
}
