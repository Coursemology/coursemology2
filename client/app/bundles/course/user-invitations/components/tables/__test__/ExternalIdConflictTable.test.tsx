import { render, screen, waitForElementToBeRemoved } from 'test-utils';
import { InvitationUpdatedItem } from 'types/course/userInvitations';

import ExternalIdConflictTable from '../ExternalIdConflictTable';

const baseItem: InvitationUpdatedItem = {
  id: 1,
  name: 'Alice Tan',
  email: 'alice@example.com',
  externalId: 'NEW001',
  previousExternalId: 'OLD001',
  role: 'student',
  phantom: false,
};

describe('ExternalIdConflictTable', () => {
  it('renders Name, Email, Current External ID, New External ID columns', async () => {
    render(<ExternalIdConflictTable rows={[baseItem]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Current External ID')).toBeInTheDocument();
    expect(screen.getByText('New External ID')).toBeInTheDocument();
  });

  it('renders row data', async () => {
    render(<ExternalIdConflictTable rows={[baseItem]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('OLD001')).toBeInTheDocument();
    expect(screen.getByText('NEW001')).toBeInTheDocument();
  });

  it('renders — when previousExternalId is null', async () => {
    render(
      <ExternalIdConflictTable
        rows={[{ ...baseItem, previousExternalId: null }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders multiple rows', async () => {
    const second: InvitationUpdatedItem = {
      ...baseItem,
      id: 2,
      name: 'Bob Lim',
      email: 'bob@example.com',
      externalId: 'B042',
      previousExternalId: null,
    };
    render(<ExternalIdConflictTable rows={[baseItem, second]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
    expect(screen.getByText('Bob Lim')).toBeInTheDocument();
  });
});
