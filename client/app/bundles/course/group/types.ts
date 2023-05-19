import { CourseUserRoles } from 'types/course/courseUsers';

interface GroupCourseUser {
  id: number;
  name: string;
  role: CourseUserRoles;
  isPhantom: boolean;
}

interface GroupMember {
  id: number;
  name: string;
  role: CourseUserRoles;
  isPhantom: boolean;
  groupRole: 'manager' | 'normal';
}

interface GroupCategory {
  id: number;
  name: string;
  description?: string;
}

interface Group {
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
  courseUsers: GroupCourseUser[];
  selectedGroupId: number;
  modifiedGroups: Group[];
  isUpdating: boolean;
}
