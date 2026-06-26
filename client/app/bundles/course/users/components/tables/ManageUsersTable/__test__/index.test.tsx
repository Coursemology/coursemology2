import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from 'test-utils';
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

  describe('sort by External ID', () => {
    it('clusters blank External IDs together when the column is sorted', async () => {
      const user = userEvent.setup();
      const users: CourseUserMiniEntity[] = [
        { ...baseUser, id: 1, name: 'Alice Lim', externalId: 'B-1' },
        { ...baseUser, id: 2, name: 'Bob Tan', externalId: null },
        { ...baseUser, id: 3, name: 'Cara Ng', externalId: 'A-1' },
      ];
      render(
        <ManageUsersTable csvDownloadFilename="users.csv" users={users} />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      const extIdHeader = screen.getByRole('columnheader', {
        name: /external id/i,
      });
      await user.click(within(extIdHeader).getByRole('button'));

      await waitFor(() => {
        const rows = screen.getAllByRole('row').slice(1); // drop the header row
        const order = rows.map(
          (r) => within(r).getByText(/Lim|Tan|Ng/).textContent,
        );
        expect(order[0]).toContain('Bob Tan'); // blank External ID sorts first
      });
    }, 10000);
  });
});
