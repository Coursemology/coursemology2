import {
  AnnouncementData,
  AnnouncementListData,
} from 'types/system/announcements';
import { CourseListData, CourseStats } from 'types/system/courses';
import { InstanceListData, InstancePermissions } from 'types/system/instances';
import { UserListData, AdminStats } from 'types/users';
import {
  SaveAnnouncementsListAction,
  DeleteAnnouncementAction,
  SAVE_ANNOUNCEMENTS_LIST,
  DELETE_ANNOUNCEMENT,
  SAVE_USERS_LIST,
  SaveUsersListAction,
  SAVE_COURSE_LIST,
  SaveCoursesListAction,
  SaveInstanceListAction,
  SAVE_INSTANCE_LIST,
  DeleteCourseAction,
  DELETE_COURSE,
  SaveAnnouncementAction,
  SAVE_ANNOUNCEMENT,
  SAVE_USER,
  SaveUserAction,
  DELETE_USER,
  DeleteUserAction,
  SaveInstanceAction,
  SAVE_INSTANCE,
  DELETE_INSTANCE,
  DeleteInstanceAction,
} from './types';

export function saveAnnouncementsList(
  announcementList: AnnouncementListData[],
): SaveAnnouncementsListAction {
  return {
    type: SAVE_ANNOUNCEMENTS_LIST,
    announcementList,
  };
}

export function deleteAnnouncement(
  announcementId: number,
): DeleteAnnouncementAction {
  return {
    type: DELETE_ANNOUNCEMENT,
    id: announcementId,
  };
}

export function saveAnnouncement(
  announcement: AnnouncementData,
): SaveAnnouncementAction {
  return { type: SAVE_ANNOUNCEMENT, announcement };
}

export function saveUsersList(
  userList: UserListData[],
  counts: AdminStats,
): SaveUsersListAction {
  return {
    type: SAVE_USERS_LIST,
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
): SaveCoursesListAction {
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
): SaveInstanceListAction {
  return {
    type: SAVE_INSTANCE_LIST,
    instanceList,
    permissions,
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
