import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';
import { Descriptor } from 'lib/hooks/useTranslation';

import { translations } from './components/navigation/UserManagementTabs';

const manageUsersHandleOf =
  (title: Descriptor | string): DataHandle =>
  (match) => {
    const courseId = match.params.courseId;

    return {
      getData: () => ({
        activePath: `/courses/${courseId}/students`,
        content: { title },
      }),
    };
  };

export const manageUserHandles = {
  enrolRequests: manageUsersHandleOf(translations.enrolRequestsTitle),
  invitations: manageUsersHandleOf(translations.userInvitationsTitle),
  students: manageUsersHandleOf(translations.manageStudents),
  staff: manageUsersHandleOf(translations.manageStaff),
  inviteUsers: manageUsersHandleOf(translations.inviteTitle),
  personalizedTimelines: manageUsersHandleOf(translations.personalTimesTitle),
};

export const courseUserHandle: DataHandle = (match) => {
  const userId = getIdFromUnknown(match.params?.userId);
  if (!userId) throw new Error(`Invalid user id: ${userId}`);

  return {
    getData: async (): Promise<CrumbPath> => {
      const { data } = await CourseAPI.users.fetch(userId);

      return {
        activePath: data.user.role !== 'student' ? null : undefined,
        content: {
          title: data.user.name,
          url: `users/${data.user.id}`,
        },
      };
    },
  };
};

export const courseUserPersonalizedTimelineHandle: DataHandle = (match) => {
  const courseId = match.params.courseId;

  const userId = getIdFromUnknown(match.params?.userId);
  if (!userId) throw new Error(`Invalid user id: ${userId}`);

  return {
    getData: async (): Promise<CrumbPath> => {
      const { data } = await CourseAPI.users.fetch(userId);

      return {
        activePath: `/courses/${courseId}/students`,
        content: [
          {
            title: translations.personalTimesTitle,
            url: `users/personal_times`,
          },
          {
            title: data.user.name,
            url: `users/${data.user.id}/personal_times`,
          },
        ],
      };
    },
  };
};
