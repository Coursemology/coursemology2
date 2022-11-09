import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { CourseListData, CourseStats } from 'types/system/courses';
import { InvitationListData } from 'types/system/instance/invitations';
import { RoleRequestListData } from 'types/system/instance/roleRequests';
import {
  InstanceAdminStats,
  InstanceUserListData,
} from 'types/system/instance/users';

import {
  DELETE_ANNOUNCEMENT,
  DELETE_COURSE,
  DELETE_INVITATION,
  DELETE_USER,
  DeleteAnnouncementAction,
  DeleteCourseAction,
  DeleteInvitationAction,
  DeleteUserAction,
  SAVE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENT_LIST,
  SAVE_COURSE_LIST,
  SAVE_INVITATION,
  SAVE_INVITATION_LIST,
  SAVE_ROLE_REQUEST,
  SAVE_ROLE_REQUEST_LIST,
  SAVE_USER,
  SAVE_USER_LIST,
  SaveAnnouncementAction,
  SaveAnnouncementListAction,
  SaveCourseListAction,
  SaveInvitationAction,
  SaveInvitationListAction,
  SaveRoleRequestAction,
  SaveRoleRequestListAction,
  SaveUserAction,
  SaveUserListAction,
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
  userList: InstanceUserListData[],
  counts: InstanceAdminStats,
): SaveUserListAction {
  return {
    type: SAVE_USER_LIST,
    userList,
    counts,
  };
}

export function saveUser(user: InstanceUserListData): SaveUserAction {
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

export function saveRoleRequestList(
  roleRequests: RoleRequestListData[],
): SaveRoleRequestListAction {
  return {
    type: SAVE_ROLE_REQUEST_LIST,
    roleRequests,
  };
}

export function saveRoleRequest(
  roleRequest: RoleRequestListData,
): SaveRoleRequestAction {
  return {
    type: SAVE_ROLE_REQUEST,
    roleRequest,
  };
}

export function saveInvitation(
  invitation: InvitationListData,
): SaveInvitationAction {
  return {
    type: SAVE_INVITATION,
    invitation,
  };
}

export function saveInvitationList(
  invitationList: InvitationListData[],
): SaveInvitationListAction {
  return {
    type: SAVE_INVITATION_LIST,
    invitationList,
  };
}

export function deleteInvitation(invitationId: number): DeleteInvitationAction {
  return {
    type: DELETE_INVITATION,
    invitationId,
  };
}
