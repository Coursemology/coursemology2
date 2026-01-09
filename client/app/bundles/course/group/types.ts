import { CourseUserRole, CourseUserShape } from 'types/course/courseUsers';

export interface GroupMember {
  id: number;
  name: string;
  role: CourseUserRole;
  isPhantom: boolean;
  groupRole: 'manager' | 'normal';
}

export interface GroupCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  members: GroupMember[];
}

export interface GroupsDialogState {
  isShown: boolean;
  dialogType: string;
  isDisabled: boolean;
}

export interface GroupsFetchState {
  isFetching: boolean;
  hasFetchError: boolean;
  groupCategory: GroupCategory | null;
  groups: Group[];
  canManageCategory: boolean;
  canManageGroups: boolean;
}

export interface GroupsManageState {
  isManagingGroups: boolean;
  hasFetchUserError: boolean;
  courseUsers: CourseUserShape[];
  selectedGroupId: number;
  modifiedGroups: Group[];
  isUpdating: boolean;
}
