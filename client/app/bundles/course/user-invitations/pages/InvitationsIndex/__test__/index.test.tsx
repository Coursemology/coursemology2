import { createMockAdapter } from 'mocks/axiosMock';
import { render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';

import InvitationsIndex from '../index';

const mock = createMockAdapter(CourseAPI.userInvitations.client);

const STUB_INVITATION = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  externalId: null,
  role: 'student',
  phantom: false,
  timelineAlgorithm: 'fixed',
  invitationKey: 'ABC123',
  confirmed: false,
  sentAt: '2024-01-01T00:00:00Z',
  confirmedAt: null,
  isRetryable: true,
};

const BASE_PERMISSIONS = {
  canManageCourseUsers: true,
  canManageEnrolRequests: true,
  canManageReferenceTimelines: false,
  canManagePersonalTimes: false,
  canRegisterWithCode: false,
};

const BASE_MANAGE_COURSE_USERS_DATA = {
  requestsCount: 0,
  invitationsCount: 0,
  defaultTimelineAlgorithm: 'fixed',
  showPersonalizedTimelineFeatures: false,
};

const mockIndexResponse = (
  showPersonalizedTimelineFeatures: boolean,
): object => ({
  invitations: [STUB_INVITATION],
  permissions: {
    ...BASE_PERMISSIONS,
    canManagePersonalTimes: showPersonalizedTimelineFeatures,
  },
  manageCourseUsersData: {
    ...BASE_MANAGE_COURSE_USERS_DATA,
    showPersonalizedTimelineFeatures,
  },
});

describe('<InvitationsIndex />', () => {
  it('shows the Personalized Timeline column when showPersonalizedTimelineFeatures is true', async () => {
    mock
      .onGet(`/courses/${global.courseId}/user_invitations`)
      .reply(200, mockIndexResponse(true));

    const page = render(<InvitationsIndex />);

    // Column only appears once invitations load. state.users is NOT pre-populated —
    // the column must come from state.invitations (the correct store).
    await waitFor(() => {
      expect(page.queryByText('Personalized Timeline')).not.toBeNull();
    });
  });

  it('hides the Personalized Timeline column when showPersonalizedTimelineFeatures is false', async () => {
    mock
      .onGet(`/courses/${global.courseId}/user_invitations`)
      .reply(200, mockIndexResponse(false));

    const page = render(<InvitationsIndex />);

    await waitFor(() => {
      expect(page.queryByText('Personalized Timeline')).toBeNull();
    });
  });
});
