import { Operation } from 'types/store';
import SystemAPI from 'api/system';
import { AnnouncementFormData } from 'types/course/announcements';
import { InstanceUserMiniEntity } from 'types/system/instance/users';
import {
  InvitationResult,
  InvitationPostData,
  InvitationsPostData,
} from 'types/system/instance/invitations';
import { ComponentData } from 'types/system/instance/components';
import { RoleRequestMiniEntity } from 'types/system/instance/roleRequests';
import { InstanceBasicListData } from 'types/system/instances';
import * as actions from './actions';

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
          payload.append('announcement[start_at]', data[field]);
          break;
        case 'endAt':
          payload.append('announcement[end_at]', data[field]);
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
  payload.append(`instance_user[role]`, data.role);
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
const formatInvitations = (invitations: InvitationPostData[]): FormData => {
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
 * Prepares and maps role request attributes to a FormData object for an post/patch request.
 * Expected FormData attributes shape:
 *   { user_role_request :
 *     { role, organization, designation, reason }
 *   }
 */
const formatRoleRequestAttributes = (data: RoleRequestMiniEntity): FormData => {
  const payload = new FormData();

  ['role', 'organization', 'designation', 'reason'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`user_role_request[${field}]`, data[field]);
    }
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
const formatComponentData = (
  components: ComponentData[],
  updatedComponentKey: string,
): FormData => {
  const payload = new FormData();

  components.forEach((component) => {
    if (component.key === updatedComponentKey && !component.enabled) {
      payload.append(
        `settings_components[enabled_component_ids][]`,
        component.key,
      );
    } else if (component.key !== updatedComponentKey && component.enabled) {
      payload.append(
        `settings_components[enabled_component_ids][]`,
        component.key,
      );
    }
  });

  return payload;
};

export const fetchInstance = async (): Promise<InstanceBasicListData> => {
  const response = await SystemAPI.instance.fetchInstance();
  return response.data.instance;
};

export function indexAnnouncements(): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .indexAnnouncements()
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveAnnouncementList(data.announcements, data.permissions),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function createAnnouncement(
  formData: AnnouncementFormData,
): Operation<void> {
  const attributes = formatAnnouncementAttributes(formData);
  return async (dispatch) =>
    SystemAPI.instance
      .createAnnouncement(attributes)
      .then((response) => {
        dispatch(actions.saveAnnouncement(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function updateAnnouncement(
  announcementId: number,
  formData: AnnouncementFormData,
): Operation<void> {
  const attributes = formatAnnouncementAttributes(formData);
  return async (dispatch) =>
    SystemAPI.instance
      .updateAnnouncement(announcementId, attributes)
      .then((response) => {
        dispatch(actions.saveAnnouncement(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteAnnouncement(announcementId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .deleteAnnouncement(announcementId)
      .then(() => {
        dispatch(actions.deleteAnnouncement(announcementId));
      })
      .catch((error) => {
        throw error;
      });
}

export function indexUsers(params?): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .indexUsers(params)
      .then((response) => {
        const data = response.data;
        dispatch(actions.saveUserList(data.users, data.counts));
      })
      .catch((error) => {
        throw error;
      });
}

export function updateUser(
  userId: number,
  userEntity: InstanceUserMiniEntity,
): Operation<void> {
  const attributes = formatUserAttributes(userEntity);
  return async (dispatch) =>
    SystemAPI.instance
      .updateUser(userId, attributes)
      .then((response) => {
        dispatch(actions.saveUser(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteUser(userId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .deleteUser(userId)
      .then(() => {
        dispatch(actions.deleteUser(userId));
      })
      .catch((error) => {
        throw error;
      });
}

export function indexCourses(params?): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .indexCourses(params)
      .then((response) => {
        const data = response.data;
        const counts = {
          totalCourses: data.totalCourses,
          activeCourses: data.activeCourses,
          coursesCount: data.coursesCount,
        };
        dispatch(actions.saveCourseList(data.courses, counts));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteCourse(courseId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .deleteCourse(courseId)
      .then(() => {
        dispatch(actions.deleteCourse(courseId));
      })
      .catch((error) => {
        throw error;
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
  const formattedData = formatComponentData(components, updatedComponentKey);
  const response = await SystemAPI.instance.updateComponents(formattedData);
  return response.data.components;
};

export function fetchRoleRequests(): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .indexRoleRequests()
      .then((response) => {
        const data = response.data;
        dispatch(actions.saveRoleRequestList(data.roleRequests));
      })
      .catch((error) => {
        throw error;
      });
}

export function approveRoleRequest(
  roleRequest: RoleRequestMiniEntity,
): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .approveRoleRequest(
        formatRoleRequestAttributes(roleRequest),
        roleRequest.id,
      )
      .then((response) => {
        const roleRequestToUpdate = response.data;
        dispatch(actions.updateRoleRequest(roleRequestToUpdate));
      })
      .catch((error) => {
        throw error;
      });
}

export function rejectRoleRequestWithMessage(
  requestId: number,
  message: string,
): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .rejectRoleRequest(requestId, message)
      .then((response) => {
        const roleRequest = response.data;
        dispatch(actions.updateRoleRequest(roleRequest));
      })
      .catch((error) => {
        throw error;
      });
}

export function rejectRoleRequest(requestId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .rejectRoleRequest(requestId)
      .then((response) => {
        const roleRequest = response.data;
        dispatch(actions.updateRoleRequest(roleRequest));
      })
      .catch((error) => {
        throw error;
      });
}

export function inviteUsersFromForm(
  postData: InvitationsPostData,
): Operation<InvitationResult> {
  const formattedData = formatInvitations(postData.invitations);
  return async () =>
    SystemAPI.instance.inviteUsers(formattedData).then((response) => {
      const data = response.data;
      return JSON.parse(data.invitationResult);
    });
}

export function fetchInvitations(): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .indexInvitations()
      .then((response) => {
        const data = response.data;
        dispatch(actions.saveUserInvitationList(data.invitations));
      })
      .catch((error) => {
        throw error;
      });
}

export function resendAllInvitations(): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .resendAllInvitations()
      .then((response) => {
        dispatch(actions.updateInvitationList(response.data.invitations));
      })
      .catch((error) => {
        throw error;
      });
}

export function resendInvitationEmail(invitationId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance
      .resendInvitationEmail(invitationId)
      .then((response) => {
        dispatch(actions.updateInvitation(response.data));
      })
      .catch((error) => {
        throw error;
      });
}

export function deleteInvitation(invitationId: number): Operation<void> {
  return async (dispatch) =>
    SystemAPI.instance.deleteInvitation(invitationId).then(() => {
      dispatch(actions.deleteInvitation(invitationId));
    });
}
