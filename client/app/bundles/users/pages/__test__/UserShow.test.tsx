import { Route, Routes } from 'react-router-dom';
import { createMockAdapter } from 'mocks/axiosMock';
import { render, screen, waitFor } from 'test-utils';

import GlobalAPI from 'api';

import UserShow from '../UserShow';

const mock = createMockAdapter(GlobalAPI.users.client);

beforeEach(() => {
  mock.reset();
});

const baseUser = {
  id: 3,
  name: 'Caitlyn',
  imageUrl: '',
};

const renderUserShow = (): void => {
  render(
    <Routes>
      <Route element={<UserShow />} path="/users/:userId" />
    </Routes>,
    { at: ['/users/3'] },
  );
};

describe('<UserShow />', () => {
  describe('instance role display', () => {
    it('displays the instance role under the user name', async () => {
      mock.onGet('/users/3').reply(200, {
        user: { ...baseUser, instanceRole: 'instructor' },
        currentCourses: [],
        completedCourses: [],
        instances: [],
      });

      renderUserShow();

      await waitFor(() =>
        expect(screen.getByText('Caitlyn')).toBeInTheDocument(),
      );
      expect(screen.getByText('Instructor')).toBeInTheDocument();
    });

    it('displays Normal for a normal instance user', async () => {
      mock.onGet('/users/3').reply(200, {
        user: { ...baseUser, instanceRole: 'normal' },
        currentCourses: [],
        completedCourses: [],
        instances: [],
      });

      renderUserShow();

      await waitFor(() =>
        expect(screen.getByText('Caitlyn')).toBeInTheDocument(),
      );
      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('renders no role element when instanceRole is absent', async () => {
      mock.onGet('/users/3').reply(200, {
        user: baseUser,
        currentCourses: [],
        completedCourses: [],
        instances: [],
      });

      renderUserShow();

      await waitFor(() =>
        expect(screen.getByText('Caitlyn')).toBeInTheDocument(),
      );
      expect(screen.queryByText('-')).not.toBeInTheDocument();
      expect(screen.queryByText('Normal')).not.toBeInTheDocument();
    });
  });
});
