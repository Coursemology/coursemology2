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

describe('<UserInvitationsTable />', () => {
  describe('search', () => {
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
          email: 'bob@example.com',
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
          email: 'bob@example.com',
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
          email: 'bob@example.com',
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
