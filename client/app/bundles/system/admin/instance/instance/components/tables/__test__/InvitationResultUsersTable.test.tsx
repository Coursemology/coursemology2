import { render, screen, waitForElementToBeRemoved } from 'test-utils';

import InvitationResultUsersTable from '../InvitationResultUsersTable';

const baseUser = {
  id: 1,
  userId: '5',
  name: 'Alice',
  email: 'alice@example.org',
  role: 'administrator' as const,
  courses: [],
};

describe('<InvitationResultUsersTable />', () => {
  describe('role column', () => {
    it('renders the translated role label for an administrator', async () => {
      render(
        <InvitationResultUsersTable
          title={<span>Invited Users</span>}
          users={[baseUser]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('renders the translated role label for an instructor', async () => {
      render(
        <InvitationResultUsersTable
          title={<span>Invited Users</span>}
          users={[{ ...baseUser, role: 'instructor' as const }]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('Instructor')).toBeInTheDocument();
    });

    it('renders the translated role label for a normal user', async () => {
      render(
        <InvitationResultUsersTable
          title={<span>Invited Users</span>}
          users={[{ ...baseUser, role: 'normal' as const }]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('Normal')).toBeInTheDocument();
    });
  });
});
