import {
  AnnouncementData,
  AnnouncementListData,
} from 'types/system/announcements';
import { CourseStats } from 'types/system/courses';
import { ComponentListData } from 'types/system/instance/components';
import { CourseListData } from 'types/system/instance/courses';
import { InvitationListData } from 'types/system/instance/invitations';
import { RoleRequestListData } from 'types/system/instance/roleRequests';
import {
  InstanceUserListData,
  InstanceAdminStats,
} from 'types/system/instance/users';
import { InstanceBasicListData } from 'types/system/instances';
import {
  SaveInstanceAction,
  SaveAnnouncementsListAction,
  DeleteAnnouncementAction,
  SaveAnnouncementAction,
  DeleteUserAction,
  SaveUserAction,
  SaveUsersListAction,
  DeleteCourseAction,
  SaveCoursesListAction,
  SaveComponentsListAction,
  SaveRoleRequestsListAction,
  UpdateRoleRequestAction,
  SaveUserInvitationsListAction,
  UpdateInvitationAction,
  UpdateInvitationListAction,
  DeleteInvitationAction,
  SAVE_INSTANCE,
  SAVE_ANNOUNCEMENTS_LIST,
  DELETE_ANNOUNCEMENT,
  SAVE_ANNOUNCEMENT,
  DELETE_USER,
  SAVE_USER,
  SAVE_USERS_LIST,
  DELETE_COURSE,
  SAVE_COURSE_LIST,
  SAVE_COMPONENTS_LIST,
  SAVE_ROLE_REQUESTS_LIST,
  UPDATE_ROLE_REQUEST,
  SAVE_USER_INVITATIONS_LIST,
  UPDATE_INVITATION,
  UPDATE_INVITATION_LIST,
  DELETE_INVITATION,
} from './types';

export function saveInstance(
  instance: InstanceBasicListData,
): SaveInstanceAction {
  return {
    type: SAVE_INSTANCE,
    instance,
  };
}

export function saveAnnouncementsList(
  announcementList: AnnouncementListData[],
): SaveAnnouncementsListAction {
  return {
    type: SAVE_ANNOUNCEMENTS_LIST,
    announcementList,
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

export function saveUsersList(
  userList: InstanceUserListData[],
  counts: InstanceAdminStats,
): SaveUsersListAction {
  return {
    type: SAVE_USERS_LIST,
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

export function saveComponentsList(componentsList: {
  enabled?: ComponentListData[];
  disabled?: ComponentListData[];
}): SaveComponentsListAction {
  return {
    type: SAVE_COMPONENTS_LIST,
    componentsList,
  };
}

export function saveRoleRequestsList(
  roleRequests: RoleRequestListData[],
): SaveRoleRequestsListAction {
  return {
    type: SAVE_ROLE_REQUESTS_LIST,
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

export function saveUserInvitationsList(
  invitations: InvitationListData[],
): SaveUserInvitationsListAction {
  return {
    type: SAVE_USER_INVITATIONS_LIST,
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
