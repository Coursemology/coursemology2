import { Permissions } from 'types';

// Permissions for rendering title bar buttons
export type FolderPermissions = Permissions<
  | 'isCurrentCourseStudent'
  | 'canStudentUpload'
  | 'canCreateSubfolder'
  | 'canUpload'
  | 'canEdit'
  | 'canEditSubfolders'
>;

export type SubfolderPermissions = Permissions<
  'canStudentUpload' | 'showSdlWarning' | 'canEdit' | 'canDelete'
>;

export type MaterialPermissions = Permissions<'canEdit' | 'canDelete'>;

export interface FolderListData {
  id: number;
  name: string;
  description: string | null;
  itemCount: number;
  updatedAt: string;
  startAt: string;
  endAt: string | null;
  effectiveStartAt: string;
  permissions: SubfolderPermissions;
}

export interface Updater {
  id: number;
  name: string;
  isCourseUser: boolean;
}

export interface MaterialListData {
  id: number;
  name: string;
  description: string | null;
  updatedAt: string;
  updater: Updater;
  permissions: MaterialPermissions;
}

export interface FolderMiniEntity {
  id: number;
  name: string;
  description: string | null;
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
  description: string | null;
  updatedAt: string;
  updater: Updater;
  permissions: MaterialPermissions;
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
  };
  subfolders: FolderListData[];
  materials: MaterialListData[];
  breadcrumbs: { id: number; name: string }[];
  advanceStartAt: number;
  permissions: FolderPermissions;
}

export interface FolderFormData {
  name: string;
  description: string | null;
  canStudentUpload: boolean;
  startAt: string;
  endAt: string | null;
}

export interface MaterialUploadFormData {
  files: File[];
}

export interface MaterialFormData {
  name: string;
  description: string;
  file: { name: string; url: string; file?: Blob };
}
