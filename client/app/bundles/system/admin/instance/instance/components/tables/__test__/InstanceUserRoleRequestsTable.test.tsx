import { render, screen, waitForElementToBeRemoved } from 'test-utils';

import InstanceUserRoleRequestsTable from '../InstanceUserRoleRequestsTable';

const baseRequest = {
  id: 1,
  userId: 5,
  name: 'Alex',
  email: 'a@example.org',
  role: 'instructor' as const,
  organization: 'NUS',
  designation: 'Lecturer',
  reason: 'To teach',
  status: 'pending',
  createdAt: '2026-01-01T00:00:00.000Z',
  confirmedBy: null,
  confirmedAt: null,
};

describe('<InstanceUserRoleRequestsTable />', () => {
  describe('name column', () => {
    it('renders the requester name as a link to their user profile', async () => {
      render(
        <InstanceUserRoleRequestsTable
          pendingRoleRequests
          roleRequests={[baseRequest]}
          title="Pending Role Requests"
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      const link = screen.getByRole('link', { name: 'Alex' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/users/5');
    });

    it('links to the correct user profile when multiple requests are shown', async () => {
      const secondRequest = { ...baseRequest, id: 2, userId: 99, name: 'Ben' };
      render(
        <InstanceUserRoleRequestsTable
          approvedRoleRequests
          roleRequests={[baseRequest, secondRequest]}
          title="Approved Role Requests"
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByRole('link', { name: 'Alex' })).toHaveAttribute(
        'href',
        '/users/5',
      );
      expect(screen.getByRole('link', { name: 'Ben' })).toHaveAttribute(
        'href',
        '/users/99',
      );
    });

    it('renders the name as plain text when userId is absent', async () => {
      const requestWithoutUser = { ...baseRequest, userId: undefined };
      render(
        <InstanceUserRoleRequestsTable
          pendingRoleRequests
          roleRequests={[requestWithoutUser]}
          title="Pending Role Requests"
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('Alex')).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'Alex' }),
      ).not.toBeInTheDocument();
    });
  });
});
