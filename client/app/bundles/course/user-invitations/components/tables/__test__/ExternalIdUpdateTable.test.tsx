import { render, screen, waitForElementToBeRemoved } from 'test-utils';
import { InvitationUpdatedItem } from 'types/course/userInvitations';

import ExternalIdUpdateTable from '../ExternalIdUpdateTable';

const baseRow: InvitationUpdatedItem = {
  id: 1,
  name: 'Alice Tan',
  email: 'alice@example.com',
  externalId: 'NEW001',
  previousExternalId: 'OLD001',
  role: 'student',
  phantom: false,
};

const settle = async (): Promise<void> => {
  await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
};

describe('ExternalIdUpdateTable', () => {
  it('renders nothing when rows is empty', async () => {
    render(<ExternalIdUpdateTable applied={false} rows={[]} />);
    await settle();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows Name, Email, both external IDs, Role and Phantom', async () => {
    render(<ExternalIdUpdateTable applied={false} rows={[baseRow]} />);
    await settle();
    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('In file')).toBeInTheDocument();
    expect(screen.getByText('OLD001')).toBeInTheDocument();
    expect(screen.getByText('NEW001')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('marks Existing as the current column and fills its cells when not applied', async () => {
    render(<ExternalIdUpdateTable applied={false} rows={[baseRow]} />);
    await settle();
    expect(screen.getByText('Existing (current)')).toBeInTheDocument();
    expect(screen.getByText('OLD001').closest('td')).toHaveClass('bg-blue-100');
    expect(screen.getByText('NEW001').closest('td')).toHaveClass(
      'text-neutral-400',
    );
  });

  it('moves the current marker and fill to In file when applied', async () => {
    render(<ExternalIdUpdateTable applied rows={[baseRow]} />);
    await settle();
    expect(screen.getByText('In file (current)')).toBeInTheDocument();
    expect(screen.getByText('NEW001').closest('td')).toHaveClass('bg-blue-100');
    expect(screen.getByText('OLD001').closest('td')).toHaveClass(
      'text-neutral-400',
    );
  });

  it('renders a null previousExternalId as an em dash in the Existing column', async () => {
    render(
      <ExternalIdUpdateTable
        applied={false}
        rows={[{ ...baseRow, previousExternalId: null }]}
      />,
    );
    await settle();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows the Personalized Timeline column when the feature is on', async () => {
    render(
      <ExternalIdUpdateTable
        applied={false}
        rows={[{ ...baseRow, timelineAlgorithm: 'fomo' }]}
        showPersonalizedTimelineFeatures
      />,
    );
    await settle();
    expect(screen.getByText('Personalized Timeline')).toBeInTheDocument();
    expect(screen.getByText('Fomo')).toBeInTheDocument();
  });
});
