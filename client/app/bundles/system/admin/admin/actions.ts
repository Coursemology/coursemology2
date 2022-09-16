import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { CourseListData, CourseStats } from 'types/system/courses';
import { InstanceListData, InstancePermissions } from 'types/system/instances';
import { UserListData, AdminStats } from 'types/users';
import {
  SaveAnnouncementListAction,
  SaveAnnouncementAction,
  DeleteAnnouncementAction,
  SaveUserListAction,
  SaveCourseListAction,
  SaveInstanceListAction,
  DeleteCourseAction,
  SaveUserAction,
  DeleteUserAction,
  SaveInstanceAction,
  DeleteInstanceAction,
  SAVE_ANNOUNCEMENT_LIST,
  DELETE_ANNOUNCEMENT,
  SAVE_USER_LIST,
  SAVE_COURSE_LIST,
  SAVE_INSTANCE_LIST,
  DELETE_COURSE,
  SAVE_ANNOUNCEMENT,
  SAVE_USER,
  DELETE_USER,
  SAVE_INSTANCE,
  DELETE_INSTANCE,
} from './types';

export function saveAnnouncementList(
  announcementList: AnnouncementListData[],
  announcementPermissions: AnnouncementPermissions,
): SaveAnnouncementListAction {
  return {
    type: SAVE_ANNOUNCEMENT_LIST,
    announcementList,
    announcementPermissions,
  };
}

export function saveAnnouncement(
  announcement: AnnouncementData,
): SaveAnnouncementAction {
  return { type: SAVE_ANNOUNCEMENT, announcement };
}

export function deleteAnnouncement(
  announcementId: number,
): DeleteAnnouncementAction {
  return {
    type: DELETE_ANNOUNCEMENT,
    id: announcementId,
  };
}

export function saveUserList(
  userList: UserListData[],
  counts: AdminStats,
): SaveUserListAction {
  return {
    type: SAVE_USER_LIST,
    userList,
    counts,
  };
}

export function saveUser(user: UserListData): SaveUserAction {
  return {
    type: SAVE_USER,
    user,
  };
}

export function deleteUser(id: number): DeleteUserAction {
  return {
    type: DELETE_USER,
    id,
  };
}

export function saveCourseList(
  courseList: CourseListData[],
  counts: CourseStats,
): SaveCourseListAction {
  return {
    type: SAVE_COURSE_LIST,
    courseList,
    counts,
  };
}

export function deleteCourse(courseId: number): DeleteCourseAction {
  return {
    type: DELETE_COURSE,
    id: courseId,
  };
}

export function saveInstanceList(
  instanceList: InstanceListData[],
  permissions: InstancePermissions,
  count: number,
): SaveInstanceListAction {
  return {
    type: SAVE_INSTANCE_LIST,
    instanceList,
    permissions,
    count,
  };
}

export function saveInstance(instance: InstanceListData): SaveInstanceAction {
  return {
    type: SAVE_INSTANCE,
    instance,
  };
}

export function deleteInstance(instanceId: number): DeleteInstanceAction {
  return {
    type: DELETE_INSTANCE,
    id: instanceId,
  };
}
