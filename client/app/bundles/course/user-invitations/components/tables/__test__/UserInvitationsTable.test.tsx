import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from 'test-utils';
import { InvitationMiniEntity } from 'types/course/userInvitations';

import UserInvitationsTable from '../UserInvitationsTable';

const baseInvitation: InvitationMiniEntity = {
  id: 1,
  name: 'Alice Lim',
  email: 'alice@example.com',
  externalId: null,
  role: 'student',
  phantom: false,
  confirmed: false,
  isRetryable: true,
  invitationKey: 'KEY001',
  sentAt: '2024-01-01T00:00:00Z',
  confirmedAt: null,
};

const SEARCH_PLACEHOLDER = 'Search by name, email or external ID';
const EMAIL_BOB = 'bob@example.com';

const storeWithTimeline = {
  invitations: {
    invitations: { ids: [], entities: {}, byId: {} },
    permissions: {
      canManageCourseUsers: false,
      canManageEnrolRequests: false,
      canManageReferenceTimelines: false,
      canManagePersonalTimes: false,
      canRegisterWithCode: false,
    },
    manageCourseUsersData: {
      requestsCount: 0,
      invitationsCount: 0,
      defaultTimelineAlgorithm: 'fixed' as const,
      showPersonalizedTimelineFeatures: true,
    },
    courseRegistrationKey: '',
  },
};

describe('<UserInvitationsTable />', () => {
  it('renders empty state when invitations is empty', async () => {
    render(<UserInvitationsTable invitations={[]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('There are no invitations.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  describe('External ID column', () => {
    it('shows column when any invitation has a non-null externalId', async () => {
      render(
        <UserInvitationsTable
          invitations={[{ ...baseInvitation, externalId: 'EXT001' }]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('External ID')).toBeInTheDocument();
    });

    it('hides column when all invitations have null externalId', async () => {
      render(<UserInvitationsTable invitations={[baseInvitation]} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.queryByText('External ID')).not.toBeInTheDocument();
    });
  });

  describe('Personalized Timeline column', () => {
    it('shows column when showPersonalizedTimelineFeatures is true', async () => {
      render(<UserInvitationsTable invitations={[baseInvitation]} />, {
        state: storeWithTimeline,
      });
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Personalized Timeline')).toBeInTheDocument();
    });

    it('hides column when showPersonalizedTimelineFeatures is false', async () => {
      render(<UserInvitationsTable invitations={[baseInvitation]} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(
        screen.queryByText('Personalized Timeline'),
      ).not.toBeInTheDocument();
    });
  });

  describe('phantom icon', () => {
    it('renders GhostIcon in name cell when phantom is true', async () => {
      render(
        <UserInvitationsTable
          invitations={[{ ...baseInvitation, phantom: true }]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      const nameEl = screen.getByText('Alice Lim');
      expect(nameEl.querySelector('[class*="MuiSvgIcon"]')).toBeInTheDocument();
    });

    it('does not render GhostIcon in name cell when phantom is false', async () => {
      render(<UserInvitationsTable invitations={[baseInvitation]} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      const nameEl = screen.getByText('Alice Lim');
      expect(
        nameEl.querySelector('[class*="MuiSvgIcon"]'),
      ).not.toBeInTheDocument();
    });
  });

  describe('status chips', () => {
    it('renders Accepted chip when confirmed is true', async () => {
      render(
        <UserInvitationsTable
          invitations={[
            {
              ...baseInvitation,
              confirmed: true,
              confirmedAt: '2024-02-01T00:00:00Z',
            },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Accepted')).toBeInTheDocument();
    });

    it('renders Pending chip when confirmed is false and isRetryable is true', async () => {
      render(
        <UserInvitationsTable
          invitations={[
            { ...baseInvitation, confirmed: false, isRetryable: true },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders Failed chip when confirmed is false and isRetryable is false', async () => {
      render(
        <UserInvitationsTable
          invitations={[
            { ...baseInvitation, confirmed: false, isRetryable: false },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  describe('actions cell', () => {
    it('renders action buttons for pending invitations', async () => {
      render(
        <UserInvitationsTable
          invitations={[
            { ...baseInvitation, id: 42, confirmed: false, isRetryable: true },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(
        document.querySelector('.invitation-delete-42'),
      ).toBeInTheDocument();
    });

    it('renders action buttons for failed invitations', async () => {
      render(
        <UserInvitationsTable
          invitations={[
            { ...baseInvitation, id: 43, confirmed: false, isRetryable: false },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(
        document.querySelector('.invitation-delete-43'),
      ).toBeInTheDocument();
    });

    it('renders no action buttons for accepted invitations', async () => {
      render(
        <UserInvitationsTable
          invitations={[
            {
              ...baseInvitation,
              id: 44,
              confirmed: true,
              confirmedAt: '2024-02-01T00:00:00Z',
            },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(
        document.querySelector('.invitation-delete-44'),
      ).not.toBeInTheDocument();
    });
  });

  describe('sort order', () => {
    it('sorts rows failed first, pending second, accepted last', async () => {
      const invitations: InvitationMiniEntity[] = [
        {
          ...baseInvitation,
          id: 1,
          name: 'AcceptedUser',
          confirmed: true,
          confirmedAt: '2024-02-01T00:00:00Z',
        },
        {
          ...baseInvitation,
          id: 2,
          name: 'FailedUser',
          email: 'failed@example.com',
          confirmed: false,
          isRetryable: false,
        },
        {
          ...baseInvitation,
          id: 3,
          name: 'PendingUser',
          email: 'pending@example.com',
          confirmed: false,
          isRetryable: true,
        },
      ];
      render(<UserInvitationsTable invitations={invitations} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      const failedEl = screen.getByText('FailedUser');
      const pendingEl = screen.getByText('PendingUser');
      const acceptedEl = screen.getByText('AcceptedUser');

      // Failed appears before Pending in DOM
      expect(
        // eslint-disable-next-line no-bitwise
        failedEl.compareDocumentPosition(pendingEl) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      // Pending appears before Accepted in DOM
      expect(
        // eslint-disable-next-line no-bitwise
        pendingEl.compareDocumentPosition(acceptedEl) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe('search', () => {
    it('filters invitations by name', async () => {
      const user = userEvent.setup();
      const invitations: InvitationMiniEntity[] = [
        { ...baseInvitation, id: 1, name: 'Alice Lim' },
        {
          ...baseInvitation,
          id: 2,
          name: 'Bob Tan',
          email: EMAIL_BOB,
        },
      ];
      render(<UserInvitationsTable invitations={invitations} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      await user.type(screen.getByPlaceholderText(SEARCH_PLACEHOLDER), 'Alice');
      expect(screen.getByText('Alice Lim')).toBeInTheDocument();
      expect(screen.queryByText('Bob Tan')).not.toBeInTheDocument();
    });

    it('filters invitations by email', async () => {
      const user = userEvent.setup();
      const invitations: InvitationMiniEntity[] = [
        { ...baseInvitation, id: 1, name: 'Alice Lim' },
        {
          ...baseInvitation,
          id: 2,
          name: 'Bob Tan',
          email: EMAIL_BOB,
        },
      ];
      render(<UserInvitationsTable invitations={invitations} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      await user.type(
        screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
        'alice@',
      );
      expect(screen.getByText('Alice Lim')).toBeInTheDocument();
      expect(screen.queryByText('Bob Tan')).not.toBeInTheDocument();
    });

    it('filters invitations by external ID', async () => {
      const user = userEvent.setup();
      const invitations: InvitationMiniEntity[] = [
        {
          ...baseInvitation,
          id: 1,
          name: 'Alice Lim',
          externalId: 'EXT-ALICE',
        },
        {
          ...baseInvitation,
          id: 2,
          name: 'Bob Tan',
          email: EMAIL_BOB,
          externalId: 'EXT-BOB',
        },
      ];

      render(<UserInvitationsTable invitations={invitations} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      await user.type(
        screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
        'EXT-ALICE',
      );

      expect(screen.getByText('Alice Lim')).toBeInTheDocument();
      expect(screen.queryByText('Bob Tan')).not.toBeInTheDocument();
    });

    it('searches external ID case-insensitively', async () => {
      const user = userEvent.setup();
      const invitations: InvitationMiniEntity[] = [
        {
          ...baseInvitation,
          id: 1,
          name: 'Alice Lim',
          externalId: 'ext-alice',
        },
        {
          ...baseInvitation,
          id: 2,
          name: 'Bob Tan',
          email: EMAIL_BOB,
          externalId: 'EXT-BOB',
        },
      ];

      render(<UserInvitationsTable invitations={invitations} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      await user.type(
        screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
        'EXT-ALICE',
      );

      expect(screen.getByText('Alice Lim')).toBeInTheDocument();
      expect(screen.queryByText('Bob Tan')).not.toBeInTheDocument();
    });

    it('shows all invitations when search is cleared', async () => {
      const user = userEvent.setup();
      const invitations: InvitationMiniEntity[] = [
        {
          ...baseInvitation,
          id: 1,
          name: 'Alice Lim',
          externalId: 'EXT-ALICE',
        },
        {
          ...baseInvitation,
          id: 2,
          name: 'Bob Tan',
          email: EMAIL_BOB,
          externalId: 'EXT-BOB',
        },
      ];

      render(<UserInvitationsTable invitations={invitations} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      const searchInput = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
      await user.type(searchInput, 'EXT-ALICE');
      expect(screen.queryByText('Bob Tan')).not.toBeInTheDocument();

      await user.clear(searchInput);
      expect(screen.getByText('Alice Lim')).toBeInTheDocument();
      expect(screen.getByText('Bob Tan')).toBeInTheDocument();
    });
  });
});
