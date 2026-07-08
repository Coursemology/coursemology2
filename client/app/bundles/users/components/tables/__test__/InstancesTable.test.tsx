import { render, screen, waitForElementToBeRemoved } from 'test-utils';

import InstancesTable from '../InstancesTable';

const baseInstance = {
  id: 1,
  name: 'Raffles Institution',
  host: 'raffles.coursemology.org',
  redirectUri: '',
};

describe('<InstancesTable />', () => {
  describe('role column', () => {
    it('renders a Role column header', async () => {
      render(
        <InstancesTable instances={[baseInstance]} title="Other Instances" />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('Role')).toBeInTheDocument();
    });

    it('displays the correct role label for a normal user', async () => {
      render(
        <InstancesTable
          instances={[{ ...baseInstance, instanceRole: 'normal' }]}
          title="Other Instances"
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('Normal')).toBeInTheDocument();
    });

    it('displays the correct role label for an instructor', async () => {
      render(
        <InstancesTable
          instances={[{ ...baseInstance, instanceRole: 'instructor' }]}
          title="Other Instances"
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('Instructor')).toBeInTheDocument();
    });

    it('displays the correct role label for an administrator', async () => {
      render(
        <InstancesTable
          instances={[{ ...baseInstance, instanceRole: 'administrator' }]}
          title="Other Instances"
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('Administrator')).toBeInTheDocument();
    });

    it('displays a dash when instanceRole is absent', async () => {
      render(
        <InstancesTable instances={[baseInstance]} title="Other Instances" />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});
