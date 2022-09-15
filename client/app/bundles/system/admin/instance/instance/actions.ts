import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { CourseListData, CourseStats } from 'types/system/courses';
import { InvitationListData } from 'types/system/instance/invitations';
import { RoleRequestListData } from 'types/system/instance/roleRequests';
import {
  InstanceUserListData,
  InstanceAdminStats,
} from 'types/system/instance/users';
import {
  SaveAnnouncementListAction,
  DeleteAnnouncementAction,
  SaveAnnouncementAction,
  DeleteUserAction,
  SaveUserAction,
  SaveUserListAction,
  DeleteCourseAction,
  SaveCourseListAction,
  SaveRoleRequestListAction,
  UpdateRoleRequestAction,
  SaveUserInvitationListAction,
  UpdateInvitationAction,
  UpdateInvitationListAction,
  DeleteInvitationAction,
  SAVE_ANNOUNCEMENT_LIST,
  DELETE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENT,
  DELETE_USER,
  SAVE_USER,
  SAVE_USER_LIST,
  DELETE_COURSE,
  SAVE_COURSE_LIST,
  SAVE_ROLE_REQUEST_LIST,
  UPDATE_ROLE_REQUEST,
  SAVE_USER_INVITATION_LIST,
  UPDATE_INVITATION,
  UPDATE_INVITATION_LIST,
  DELETE_INVITATION,
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

export function updateRoleRequest(
  roleRequest: RoleRequestListData,
): UpdateRoleRequestAction {
  return {
    type: UPDATE_ROLE_REQUEST,
    roleRequest,
  };
}

export function saveUserInvitationList(
  invitations: InvitationListData[],
): SaveUserInvitationListAction {
  return {
    type: SAVE_USER_INVITATION_LIST,
    invitations,
  };
}

export function updateInvitation(
  invitation: InvitationListData,
): UpdateInvitationAction {
  return {
    type: UPDATE_INVITATION,
    invitation,
  };
}

export function updateInvitationList(
  invitationList: InvitationListData[],
): UpdateInvitationListAction {
  return {
    type: UPDATE_INVITATION_LIST,
    invitationList,
  };
}

export function deleteInvitation(invitationId: number): DeleteInvitationAction {
  return {
    type: DELETE_INVITATION,
    invitationId,
  };
}
