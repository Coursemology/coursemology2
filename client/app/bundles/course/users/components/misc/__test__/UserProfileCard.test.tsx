import { render, screen, waitForElementToBeRemoved } from 'test-utils';

import UserProfileCard from '../UserProfileCard';

const baseUser = {
  id: 2,
  name: 'test',
  email: 'test@example.org',
  role: 'student' as const,
  level: 0,
  exp: 0,
  isSuspended: false,
  canReadStatistics: false,
  referenceTimelineId: null,
};

describe('<UserProfileCard />', () => {
  describe('when the viewer is staff (userId present)', () => {
    it('renders the name as a link to the global user profile', async () => {
      render(<UserProfileCard user={{ ...baseUser, userId: 3 }} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      const link = screen.getByRole('link', { name: 'test' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/users/3');
    });
  });

  describe('when the viewer is a student (userId absent)', () => {
    it('renders the name as plain text without a link', async () => {
      render(<UserProfileCard user={baseUser} />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('test')).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: 'test' }),
      ).not.toBeInTheDocument();
    });
  });
});
