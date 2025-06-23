import { Operation } from 'store';
import { AnnouncementFormData } from 'types/course/announcements';
import { ComponentData } from 'types/system/instance/components';
import {
  InvitationPostData,
  InvitationResult,
  InvitationsPostData,
} from 'types/system/instance/invitations';
import {
  RoleRequestMiniEntity,
  UserRoleRequestForm,
} from 'types/system/instance/roleRequests';
import { InstanceUserMiniEntity } from 'types/system/instance/users';
import { InstanceBasicListData } from 'types/system/instances';

import SystemAPI from 'api/system';
import { InstanceGetHelpActivity } from 'course/statistics/types';

import { actions } from './store';

/**
 * Prepares and maps announcement object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { announcement :
 *     { title, content, startAt, endAt }
 *   }
 */
const formatAnnouncementAttributes = (data: AnnouncementFormData): FormData => {
  const payload = new FormData();

  ['title', 'content', 'startAt', 'endAt'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      switch (field) {
        case 'startAt':
          payload.append('announcement[start_at]', data[field].toString());
          break;
        case 'endAt':
          payload.append('announcement[end_at]', data[field].toString());
          break;
        default:
          payload.append(`announcement[${field}]`, data[field]);
          break;
      }
    }
  });
  return payload;
};

/**
 * Prepares and maps user object attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { user :
 *     { role }
 *   }
 */
const formatUserAttributes = (data: InstanceUserMiniEntity): FormData => {
  const payload = new FormData();
  payload.append('instance_user[role]', data.role);
  return payload;
};

/**
 * Prepares and maps answer value in the react-hook-form into server side format.
 *
 * Expected FormData attributes shape:
 *   { user :
 *     { name, role }
 *   }
 */
const formatInvitationAttributes = (
  invitations: InvitationPostData[],
): FormData => {
  const payload = new FormData();

  invitations.forEach((invite, index) => {
    ['name', 'email', 'role'].forEach((field) => {
      if (invite[field] !== undefined && invite[field] !== null) {
        const fieldName = field;
        const value = invite[field];
        payload.append(
          `instance[invitations_attributes][${index}][${fieldName}]`,
          value,
        );
      }
    });
  });
  return payload;
};

/**
 * Converts component data into server side format.
 * Expected FormData attributes shape:
 * { settings_components :
 *   enabled_component_ids[]
 * }
 */
const formatComponentAttributes = (
  components: ComponentData[],
  updatedComponentKey: string,
): FormData => {
  const payload = new FormData();

  components.forEach((component) => {
    if (
      (component.key === updatedComponentKey && !component.enabled) ||
      (component.key !== updatedComponentKey && component.enabled)
    ) {
      payload.append(
        'settings_components[enabled_component_ids][]',
        component.key,
      );
    }
  });

  return payload;
};

/**
 * Prepares and maps role request attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { user_role_request :
 *     { role, organization, designation, reason }
 *   }
 */
const formatRoleRequestAttributes = (
  data: RoleRequestMiniEntity | UserRoleRequestForm,
): FormData => {
  const payload = new FormData();

  ['role', 'organization', 'designation', 'reason'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`user_role_request[${field}]`, data[field]);
    }
  });

  return payload;
};

export const fetchInstance = async (): Promise<InstanceBasicListData> => {
  const response = await SystemAPI.instance.fetchInstance();
  return response.data.instance;
};

export function indexAnnouncements(): Operation {
  return async (dispatch) =>
    SystemAPI.instance.indexAnnouncements().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveAnnouncementList(data.announcements, data.permissions),
      );
    });
}

export function createAnnouncement(formData: AnnouncementFormData): Operation {
  const attributes = formatAnnouncementAttributes(formData);
  return async (dispatch) =>
    SystemAPI.instance.createAnnouncement(attributes).then((response) => {
      dispatch(actions.saveAnnouncement(response.data));
    });
}

export function updateAnnouncement(
  announcementId: number,
  formData: AnnouncementFormData,
): Operation {
  const attributes = formatAnnouncementAttributes(formData);
  return async (dispatch) =>
    SystemAPI.instance
      .updateAnnouncement(announcementId, attributes)
      .then((response) => {
        dispatch(actions.saveAnnouncement(response.data));
      });
}

export function deleteAnnouncement(announcementId: number): Operation {
  return async (dispatch) =>
    SystemAPI.instance.deleteAnnouncement(announcementId).then(() => {
      dispatch(actions.deleteAnnouncement(announcementId));
    });
}

export function indexUsers(params?): Operation {
  return async (dispatch) =>
    SystemAPI.instance.indexUsers(params).then((response) => {
      const data = response.data;
      dispatch(actions.saveUserList(data.users, data.counts));
    });
}

export function updateUser(
  userId: number,
  userEntity: InstanceUserMiniEntity,
): Operation {
  const attributes = formatUserAttributes(userEntity);
  return async (dispatch) =>
    SystemAPI.instance.updateUser(userId, attributes).then((response) => {
      dispatch(actions.saveUser(response.data));
    });
}

export function deleteUser(userId: number): Operation {
  return async (dispatch) =>
    SystemAPI.instance.deleteUser(userId).then(() => {
      dispatch(actions.deleteUser(userId));
    });
}

export function indexCourses(params?): Operation {
  return async (dispatch) =>
    SystemAPI.instance.indexCourses(params).then((response) => {
      const data = response.data;
      const counts = {
        totalCourses: data.totalCourses,
        activeCourses: data.activeCourses,
        coursesCount: data.coursesCount,
      };
      dispatch(actions.saveCourseList(data.courses, counts));
    });
}

export function deleteCourse(courseId: number): Operation {
  return async (dispatch) =>
    SystemAPI.instance.deleteCourse(courseId).then(() => {
      dispatch(actions.deleteCourse(courseId));
    });
}

export const indexComponents = async (): Promise<ComponentData[]> => {
  const response = await SystemAPI.instance.indexComponents();
  return response.data.components;
};

export const updateComponents = async (
  components: ComponentData[],
  updatedComponentKey: string,
): Promise<ComponentData[]> => {
  const formattedData = formatComponentAttributes(
    components,
    updatedComponentKey,
  );
  const response = await SystemAPI.instance.updateComponents(formattedData);
  return response.data.components;
};

export function fetchInvitations(): Operation {
  return async (dispatch) =>
    SystemAPI.instance.indexInvitations().then((response) => {
      const data = response.data;
      dispatch(actions.saveInvitationList(data.invitations));
    });
}

export function deleteInvitation(invitationId: number): Operation {
  return async (dispatch) =>
    SystemAPI.instance.deleteInvitation(invitationId).then(() => {
      dispatch(actions.deleteInvitation(invitationId));
    });
}

export function inviteUsers(
  postData: InvitationsPostData,
): Operation<InvitationResult> {
  const formattedData = formatInvitationAttributes(postData.invitations);
  return async () =>
    SystemAPI.instance.inviteUsers(formattedData).then((response) => {
      const data = response.data;
      return JSON.parse(data.invitationResult);
    });
}

export function resendAllInvitations(): Operation {
  return async (dispatch) =>
    SystemAPI.instance.resendAllInvitations().then((response) => {
      dispatch(actions.saveInvitationList(response.data.invitations));
    });
}

export function resendInvitationEmail(invitationId: number): Operation {
  return async (dispatch) =>
    SystemAPI.instance.resendInvitationEmail(invitationId).then((response) => {
      dispatch(actions.saveInvitation(response.data));
    });
}

export function fetchRoleRequests(): Operation {
  return async (dispatch) =>
    SystemAPI.instance.indexRoleRequests().then((response) => {
      const data = response.data;
      dispatch(actions.saveRoleRequestList(data.roleRequests));
    });
}

export const createRoleRequest = async (
  roleRequest: UserRoleRequestForm,
): Promise<{ id: number }> => {
  const formattedData = formatRoleRequestAttributes(roleRequest);
  const response = await SystemAPI.instance.createRoleRequest(formattedData);
  return response.data;
};

export const updateRoleRequest = async (
  roleRequest: UserRoleRequestForm,
  roleRequestId: number,
): Promise<{ id: number }> => {
  const formattedData = formatRoleRequestAttributes(roleRequest);
  const response = await SystemAPI.instance.updateRoleRequest(
    roleRequestId,
    formattedData,
  );
  return response.data;
};

export function approveRoleRequest(
  roleRequest: RoleRequestMiniEntity,
): Operation {
  return async (dispatch) =>
    SystemAPI.instance
      .approveRoleRequest(
        formatRoleRequestAttributes(roleRequest),
        roleRequest.id,
      )
      .then((response) => {
        const roleRequestToUpdate = response.data;
        dispatch(actions.saveRoleRequest(roleRequestToUpdate));
      });
}

export function rejectRoleRequest(
  requestId: number,
  message?: string,
): Operation {
  return async (dispatch) =>
    SystemAPI.instance
      .rejectRoleRequest(requestId, message)
      .then((response) => {
        const roleRequest = response.data;
        dispatch(actions.saveRoleRequest(roleRequest));
      });
}

export const fetchInstanceGetHelpActivity = async (params: {
  start_at: string;
  end_at: string;
}): Promise<InstanceGetHelpActivity[]> => {
  const response =
    await SystemAPI.instance.fetchInstanceGetHelpActivity(params);
  return response.data;
};
