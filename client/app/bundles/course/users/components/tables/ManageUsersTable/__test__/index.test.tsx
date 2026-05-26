import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from 'test-utils';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import ManageUsersTable from '../index';

const baseUser: CourseUserMiniEntity = {
  id: 1,
  name: 'Alice Lim',
  email: 'alice@example.com',
  role: 'student',
};

const SEARCH_PLACEHOLDER = 'Search by name, email or external ID';

describe('<ManageUsersTable />', () => {
  describe('search', () => {
    it('filters users by external ID', async () => {
      const user = userEvent.setup();
      const users: CourseUserMiniEntity[] = [
        { ...baseUser, id: 1, name: 'Alice Lim', externalId: 'EXT-ALICE' },
        {
          ...baseUser,
          id: 2,
          name: 'Bob Tan',
          email: 'bob@example.com',
          externalId: 'EXT-BOB',
        },
      ];

      render(
        <ManageUsersTable csvDownloadFilename="users.csv" users={users} />,
      );
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
      const users: CourseUserMiniEntity[] = [
        { ...baseUser, id: 1, name: 'Alice Lim', externalId: 'ext-alice' },
        {
          ...baseUser,
          id: 2,
          name: 'Bob Tan',
          email: 'bob@example.com',
          externalId: 'EXT-BOB',
        },
      ];

      render(
        <ManageUsersTable csvDownloadFilename="users.csv" users={users} />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      await user.type(
        screen.getByPlaceholderText(SEARCH_PLACEHOLDER),
        'EXT-ALICE',
      );

      expect(screen.getByText('Alice Lim')).toBeInTheDocument();
      expect(screen.queryByText('Bob Tan')).not.toBeInTheDocument();
    });

    it('shows all users when search is cleared', async () => {
      const user = userEvent.setup();
      const users: CourseUserMiniEntity[] = [
        { ...baseUser, id: 1, name: 'Alice Lim', externalId: 'EXT-ALICE' },
        {
          ...baseUser,
          id: 2,
          name: 'Bob Tan',
          email: 'bob@example.com',
          externalId: 'EXT-BOB',
        },
      ];

      render(
        <ManageUsersTable csvDownloadFilename="users.csv" users={users} />,
      );
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
