import { EntityStore } from 'types/store';
import {
  InstanceBasicListData,
  InstanceBasicMiniEntity,
} from 'types/system/instances';
import {
  UserBasicListData,
  UserBasicMiniEntity,
  UserCourseListData,
  UserCourseMiniEntity,
} from 'types/users';

// Action Names
export const SAVE_USER = 'system/SAVE_USER';
export const SAVE_COURSE_LIST = 'system/SAVE_COURSE_LIST';
export const SAVE_INSTANCE_LIST = 'system/SAVE_INSTANCE_LIST';

// Action Types
export interface SaveUserAction {
  type: typeof SAVE_USER;
  user: UserBasicListData;
}

export interface SaveCourseListAction {
  type: typeof SAVE_COURSE_LIST;
  courses: UserCourseListData[];
  courseType: 'current' | 'completed';
}

export interface SaveInstanceListAction {
  type: typeof SAVE_INSTANCE_LIST;
  instances: InstanceBasicListData[];
}

export type GlobalActionType =
  | SaveUserAction
  | SaveCourseListAction
  | SaveInstanceListAction;

// State Types
export interface GlobalUserState {
  user: UserBasicMiniEntity;
  currentCourses: EntityStore<UserCourseMiniEntity>;
  completedCourses: EntityStore<UserCourseMiniEntity>;
  instances: EntityStore<InstanceBasicMiniEntity>;
}
