import userEvent from '@testing-library/user-event';
import { render, screen, waitForElementToBeRemoved } from 'test-utils';
import { InvitationUpdatedItem } from 'types/course/userInvitations';

import ExternalIdConflictPrompt from '../ExternalIdConflictPrompt';

const invitationUpdate: InvitationUpdatedItem = {
  id: 1,
  name: 'Alice Tan',
  email: 'alice@example.com',
  externalId: 'NEW001',
  previousExternalId: 'OLD001',
  role: 'student',
  phantom: false,
};

const courseUserUpdate: InvitationUpdatedItem = {
  id: 2,
  name: 'Bob Lim',
  email: 'bob@example.com',
  externalId: 'B042',
  previousExternalId: null,
  role: 'student',
  phantom: false,
};

const noop = (): void => {};

describe('ExternalIdConflictPrompt', () => {
  it('renders the title', async () => {
    render(
      <ExternalIdConflictPrompt
        onCancel={noop}
        onKeepExisting={noop}
        onReplaceAll={noop}
        pendingCourseUserUpdates={[]}
        pendingInvitationUpdates={[invitationUpdate]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Confirm External ID Updates')).toBeInTheDocument();
  });

  it('renders the invitation updates section when non-empty', async () => {
    render(
      <ExternalIdConflictPrompt
        onCancel={noop}
        onKeepExisting={noop}
        onReplaceAll={noop}
        pendingCourseUserUpdates={[]}
        pendingInvitationUpdates={[invitationUpdate]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText(/Pending Invitation Updates/)).toBeInTheDocument();
    expect(screen.getByText('Alice Tan')).toBeInTheDocument();
  });

  it('does not render invitation section when empty', async () => {
    render(
      <ExternalIdConflictPrompt
        onCancel={noop}
        onKeepExisting={noop}
        onReplaceAll={noop}
        pendingCourseUserUpdates={[courseUserUpdate]}
        pendingInvitationUpdates={[]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(
      screen.queryByText(/Pending Invitation Updates/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Pending Course Member Updates/),
    ).toBeInTheDocument();
  });

  it('renders both sections when both non-empty', async () => {
    render(
      <ExternalIdConflictPrompt
        onCancel={noop}
        onKeepExisting={noop}
        onReplaceAll={noop}
        pendingCourseUserUpdates={[courseUserUpdate]}
        pendingInvitationUpdates={[invitationUpdate]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText(/Pending Invitation Updates/)).toBeInTheDocument();
    expect(
      screen.getByText(/Pending Course Member Updates/),
    ).toBeInTheDocument();
  });

  it('calls onCancel when Go Back is clicked', async () => {
    const onCancel = jest.fn();
    render(
      <ExternalIdConflictPrompt
        onCancel={onCancel}
        onKeepExisting={noop}
        onReplaceAll={noop}
        pendingCourseUserUpdates={[]}
        pendingInvitationUpdates={[invitationUpdate]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    await userEvent.click(screen.getByRole('button', { name: 'Go Back' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onKeepExisting when Keep Existing is clicked', async () => {
    const onKeepExisting = jest.fn();
    render(
      <ExternalIdConflictPrompt
        onCancel={noop}
        onKeepExisting={onKeepExisting}
        onReplaceAll={noop}
        pendingCourseUserUpdates={[]}
        pendingInvitationUpdates={[invitationUpdate]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    await userEvent.click(
      screen.getByRole('button', { name: 'Keep Existing' }),
    );
    expect(onKeepExisting).toHaveBeenCalledTimes(1);
  });

  it('calls onReplaceAll when Replace is clicked', async () => {
    const onReplaceAll = jest.fn();
    render(
      <ExternalIdConflictPrompt
        onCancel={noop}
        onKeepExisting={noop}
        onReplaceAll={onReplaceAll}
        pendingCourseUserUpdates={[]}
        pendingInvitationUpdates={[invitationUpdate]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    await userEvent.click(screen.getByRole('button', { name: 'Replace' }));
    expect(onReplaceAll).toHaveBeenCalledTimes(1);
  });
});
