import { render, screen, waitForElementToBeRemoved } from 'test-utils';

import UsersTable from '../UsersTable';

const baseUserCounts = {
  totalUsers: { allCount: 1 },
  activeUsers: { allCount: 1 },
  coursesCount: 0,
  usersCount: 1,
  totalCourses: 0,
  activeCourses: 0,
  instancesCount: 1,
};

const baseUser = {
  id: 42,
  name: 'Bob',
  email: 'bob@example.org',
  role: 'normal' as const,
  instances: [
    { name: 'Main Instance', host: 'main.coursemology.org', courses: [] },
  ],
};

describe('<UsersTable />', () => {
  describe('instances column', () => {
    it('links to the user profile on the instance, not the admin list', async () => {
      render(
        <UsersTable
          filter={{ active: true, role: 'normal' }}
          renderRowActionComponent={() => <span />}
          title="Users"
          userCounts={baseUserCounts}
          users={[baseUser]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      const link = screen.getByRole('link', { name: /Main Instance/ });
      expect(link).toHaveAttribute('href', '//main.coursemology.org/users/42');
    });
  });
});
