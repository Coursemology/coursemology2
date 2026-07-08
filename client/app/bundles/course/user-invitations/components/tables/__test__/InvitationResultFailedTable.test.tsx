import { render, screen, waitForElementToBeRemoved } from 'test-utils';
import { FailedInvitationRowData } from 'types/course/userInvitations';

import InvitationResultFailedTable from '../InvitationResultFailedTable';

const baseUser: FailedInvitationRowData = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  role: 'student',
  reason: 'failed_to_send',
};

describe('InvitationResultFailedTable', () => {
  it('renders nothing when users is empty', async () => {
    render(<InvitationResultFailedTable users={[]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders name and email for each row', async () => {
    render(
      <InvitationResultFailedTable
        users={[{ ...baseUser, reason: 'duplicate_email_in_file' }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders reason label for duplicate_email_in_file', async () => {
    render(
      <InvitationResultFailedTable
        users={[{ ...baseUser, reason: 'duplicate_email_in_file' }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(
      screen.getByText('Duplicate email in uploaded CSV'),
    ).toBeInTheDocument();
  });

  it('renders reason label for external_id_taken', async () => {
    render(
      <InvitationResultFailedTable
        users={[{ ...baseUser, reason: 'external_id_taken' }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(
      screen.getByText('External ID is taken by another course member'),
    ).toBeInTheDocument();
  });

  it('renders reason label for duplicate_external_id_in_file', async () => {
    render(
      <InvitationResultFailedTable
        users={[{ ...baseUser, reason: 'duplicate_external_id_in_file' }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(
      screen.getByText('Duplicate external ID in uploaded CSV'),
    ).toBeInTheDocument();
  });

  it('renders reason label for missing_email', async () => {
    render(
      <InvitationResultFailedTable
        users={[{ ...baseUser, email: '', reason: 'missing_email' }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Missing email')).toBeInTheDocument();
  });

  it('renders reason label for failed_to_send', async () => {
    render(<InvitationResultFailedTable users={[baseUser]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(
      screen.getByText(
        'Failed to send invitation email, please try again - if failures persist, contact us for assistance',
      ),
    ).toBeInTheDocument();
  });

  it('shows Role and Phantom columns', async () => {
    render(
      <InvitationResultFailedTable
        users={[
          { ...baseUser, phantom: false, reason: 'duplicate_email_in_file' },
        ]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Student')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('renders Yes for phantom user', async () => {
    render(
      <InvitationResultFailedTable
        users={[
          { ...baseUser, phantom: true, reason: 'duplicate_email_in_file' },
        ]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('shows External ID column when any user has a non-null externalId', async () => {
    render(
      <InvitationResultFailedTable
        users={[
          { ...baseUser, externalId: 'ext123', reason: 'external_id_taken' },
        ]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('External ID')).toBeInTheDocument();
    expect(screen.getByText('ext123')).toBeInTheDocument();
  });

  it('renders empty cell for null externalId when column is shown by another row', async () => {
    render(
      <InvitationResultFailedTable
        users={[
          { ...baseUser, externalId: 'ext123', reason: 'external_id_taken' },
          {
            ...baseUser,
            id: 2,
            name: 'Bob',
            externalId: null,
            reason: 'duplicate_email_in_file',
          },
        ]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('External ID')).toBeInTheDocument();
    expect(screen.getByText('ext123')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('hides External ID column when all users have no externalId', async () => {
    render(<InvitationResultFailedTable users={[baseUser]} />);
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText('External ID')).not.toBeInTheDocument();
  });

  it('applies red highlight class to the failed_to_send row', async () => {
    const { container } = render(
      <InvitationResultFailedTable
        users={[
          baseUser,
          {
            ...baseUser,
            id: 2,
            name: 'Bob',
            reason: 'duplicate_email_in_file',
          },
        ]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    const rows = Array.from(container.querySelectorAll('tr'));
    const aliceRow = rows.find((tr) => tr.textContent?.includes('Alice'));
    const bobRow = rows.find((tr) => tr.textContent?.includes('Bob'));
    expect(aliceRow?.className).toContain('bg-[#ffebee]');
    expect(bobRow?.className).not.toContain('bg-[#ffebee]');
  });

  it('does not apply red highlight class to non-failed_to_send rows', async () => {
    const { container } = render(
      <InvitationResultFailedTable
        users={[{ ...baseUser, reason: 'duplicate_email_in_file' }]}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    const highlighted = Array.from(container.querySelectorAll('tr')).find(
      (tr) => tr.className.includes('bg-[#ffebee]'),
    );
    expect(highlighted).toBeUndefined();
  });

  describe('Personalized Timeline column', () => {
    it('shows column header and algorithm label when showPersonalizedTimelineFeatures is true', async () => {
      render(
        <InvitationResultFailedTable
          showPersonalizedTimelineFeatures
          users={[
            {
              ...baseUser,
              timelineAlgorithm: 'stragglers',
              reason: 'duplicate_email_in_file',
            },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Personalized Timeline')).toBeInTheDocument();
      expect(screen.getByText('Stragglers')).toBeInTheDocument();
    });

    it('hides column when showPersonalizedTimelineFeatures is false', async () => {
      render(
        <InvitationResultFailedTable
          showPersonalizedTimelineFeatures={false}
          users={[
            {
              ...baseUser,
              timelineAlgorithm: 'stragglers',
              reason: 'duplicate_email_in_file',
            },
          ]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(
        screen.queryByText('Personalized Timeline'),
      ).not.toBeInTheDocument();
    });

    it('shows dash when timelineAlgorithm is undefined', async () => {
      render(
        <InvitationResultFailedTable
          showPersonalizedTimelineFeatures
          users={[{ ...baseUser, reason: 'duplicate_email_in_file' }]}
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Personalized Timeline')).toBeInTheDocument();
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});
