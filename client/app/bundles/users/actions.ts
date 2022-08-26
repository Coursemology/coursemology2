import { InstanceBasicListData } from 'types/system/instances';
import { UserBasicListData, UserCourseListData } from 'types/users';
import {
  SaveUserAction,
  SAVE_USER,
  SAVE_COURSE_LIST,
  SaveCourseListAction,
  SaveInstanceListAction,
  SAVE_INSTANCE_LIST,
} from './types';

export function saveUser(user: UserBasicListData): SaveUserAction {
  return { type: SAVE_USER, user };
}

export function saveCourses(
  courses: UserCourseListData[],
  courseType: 'current' | 'completed',
): SaveCourseListAction {
  return { type: SAVE_COURSE_LIST, courses, courseType };
}
export function saveInstances(
  instances: InstanceBasicListData[],
): SaveInstanceListAction {
  return { type: SAVE_INSTANCE_LIST, instances };
}
