import { render, screen, waitForElementToBeRemoved } from 'test-utils';
import { CourseUserData } from 'types/course/courseUsers';
import {
  FailedInvitationRowData,
  InvitationListData,
  InvitationResult,
  InvitationUpdatedItem,
} from 'types/course/userInvitations';

import InvitationResultDialog from '../InvitationResultDialog';

const CAROL_EMAIL = 'carol@example.com';

const carolDuplicateUser: FailedInvitationRowData = {
  id: 3,
  name: 'Carol',
  email: CAROL_EMAIL,
  role: 'student',
  reason: 'duplicate_email_in_file',
};

const baseInvitation: InvitationListData = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  externalId: null,
  role: 'student',
  phantom: false,
  invitationKey: 'abc',
  confirmed: false,
  sentAt: null,
  confirmedAt: null,
  isRetryable: true,
};

const failedInvitation: InvitationListData = {
  ...baseInvitation,
  id: 99,
  name: 'FailedUser',
  email: 'failed@example.com',
  isRetryable: false,
};

const baseCourseUser = {
  id: 2,
  name: 'Bob',
  email: 'bob@example.com',
  externalId: null,
  role: 'student',
  phantom: false,
  level: 0,
  exp: 0,
  canReadStatistics: false,
} as CourseUserData;

const noop = (): void => {};

const renderDialog = (result: InvitationResult): void => {
  render(
    <InvitationResultDialog
      handleClose={noop}
      invitationResult={result}
      open
    />,
  );
};

describe('InvitationResultDialog', () => {
  // Lifecycle
  it('renders nothing when closed', async () => {
    render(
      <InvitationResultDialog
        handleClose={noop}
        invitationResult={{}}
        open={false}
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hides all optional sections when data is empty', async () => {
    renderDialog({});
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText(/Failed/)).not.toBeInTheDocument();
    expect(screen.queryByText(/New Invitations/)).not.toBeInTheDocument();
    expect(screen.queryByText(/New Course Users/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Existing Invitations/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Existing Course Users/)).not.toBeInTheDocument();
  });

  // Summary line
  it('shows summary text with correct counts', async () => {
    renderDialog({
      newInvitations: [baseInvitation],
      newCourseUsers: [baseCourseUser],
      existingInvitations: [{ ...baseInvitation, id: 3 }],
      existingCourseUsers: [{ ...baseCourseUser, id: 4 }],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(
      screen.getByText(
        /1 new invitation sent, 1 directly enrolled, 2 already in course/,
      ),
    ).toBeInTheDocument();
  });

  it('prepends failed count to summary when failures present', async () => {
    renderDialog({ failedUsers: [carolDuplicateUser] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText(/1 failed\./)).toBeInTheDocument();
  });

  it('does not prepend failed count to summary when count is zero', async () => {
    renderDialog({ newInvitations: [baseInvitation] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText(/failed\./)).not.toBeInTheDocument();
  });

  // Failed section
  it('shows Failed section when failedUsers is non-empty', async () => {
    renderDialog({ failedUsers: [carolDuplicateUser] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Failed (1)')).toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });

  it('renders Failed before New Invitations in DOM', async () => {
    renderDialog({
      newInvitations: [baseInvitation],
      failedUsers: [carolDuplicateUser],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    const headings = screen
      .getAllByRole('heading')
      .map((h) => h.textContent ?? '');
    const needsIdx = headings.findIndex((h) => h.includes('Failed'));
    const newInvIdx = headings.findIndex((h) => h.includes('New Invitations'));
    expect(needsIdx).toBeGreaterThanOrEqual(0);
    expect(newInvIdx).toBeGreaterThanOrEqual(0);
    expect(needsIdx).toBeLessThan(newInvIdx);
  });

  it('shows failed invitation in Failed, not Existing Invitations', async () => {
    renderDialog({ existingInvitations: [failedInvitation] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Failed (1)')).toBeInTheDocument();
    expect(screen.getByText('FailedUser')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Failed to send invitation email, please try again - if failures persist, contact us for assistance',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Existing Invitations/)).not.toBeInTheDocument();
  });

  it('shows failed invitation with non-null externalId in Failed, not Existing Invitations', async () => {
    const failedWithExtId: InvitationListData = {
      ...baseInvitation,
      id: 100,
      name: 'FailedWithExtId',
      email: 'failedext@example.com',
      externalId: 'old-id',
      isRetryable: false,
    };
    renderDialog({ existingInvitations: [failedWithExtId] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Failed (1)')).toBeInTheDocument();
    expect(screen.getByText('FailedWithExtId')).toBeInTheDocument();
    expect(screen.queryByText(/Existing Invitations/)).not.toBeInTheDocument();
  });

  it('keeps retryable existing invitation in Existing Invitations section', async () => {
    renderDialog({
      existingInvitations: [{ ...baseInvitation, id: 7, name: 'Retryable' }],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Existing Invitations (1)')).toBeInTheDocument();
    expect(screen.getByText('Retryable')).toBeInTheDocument();
    expect(screen.queryByText(/Failed/)).not.toBeInTheDocument();
  });

  it('does not count failed invitations in alreadyInCourse summary', async () => {
    renderDialog({
      existingInvitations: [failedInvitation],
      existingCourseUsers: [baseCourseUser],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(
      screen.getByText(
        /0 new invitations sent, 0 directly enrolled, 1 already in course/,
      ),
    ).toBeInTheDocument();
  });

  it('shows failedRowsSubtitle when failed_to_send rows exist', async () => {
    renderDialog({ existingInvitations: [failedInvitation] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(
      screen.getByText('1 row highlighted in red could not be sent'),
    ).toBeInTheDocument();
  });

  it('does not show failedRowsSubtitle when only duplicate users exist', async () => {
    renderDialog({ failedUsers: [carolDuplicateUser] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText(/highlighted in red/)).not.toBeInTheDocument();
  });

  it('shows failedRowsSubtitle with failed_to_send count only when mixed failures', async () => {
    renderDialog({
      existingInvitations: [failedInvitation],
      failedUsers: [carolDuplicateUser],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Failed (2)')).toBeInTheDocument();
    expect(
      screen.getByText('1 row highlighted in red could not be sent'),
    ).toBeInTheDocument();
  });

  // New Invitations section
  it('shows New Invitations section when newInvitations is non-empty', async () => {
    renderDialog({ newInvitations: [baseInvitation] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('New Invitations (1)')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('hides New Invitations section when empty', async () => {
    renderDialog({ newInvitations: [] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText(/New Invitations/)).not.toBeInTheDocument();
  });

  // New Course Users section
  it('shows New Course Users section when non-empty', async () => {
    renderDialog({ newCourseUsers: [baseCourseUser] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('New Course Users (1)')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('hides New Course Users section when empty', async () => {
    renderDialog({ newCourseUsers: [] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText(/New Course Users/)).not.toBeInTheDocument();
  });

  // Existing Invitations section
  it('shows Existing Invitations section with name visible', async () => {
    renderDialog({
      existingInvitations: [{ ...baseInvitation, id: 5, name: 'Charlie' }],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Existing Invitations (1)')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('hides Existing Invitations section when both existingInvitations and updatedInvitations are empty', async () => {
    renderDialog({ newInvitations: [baseInvitation] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText(/Existing Invitations/)).not.toBeInTheDocument();
  });

  it('shows updatedSubtitle in Existing Invitations when updatedInvitations is non-empty', async () => {
    const updatedItem: InvitationUpdatedItem = {
      id: 10,
      name: 'Carol',
      email: CAROL_EMAIL,
      externalId: 'EXT001',
      previousExternalId: null,
      role: 'student',
      phantom: false,
    };
    renderDialog({ updatedInvitations: [updatedItem] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Existing Invitations (1)')).toBeInTheDocument();
    expect(screen.getByText('1 updated · shown first')).toBeInTheDocument();
  });

  it('does not show updatedSubtitle when updatedInvitations is empty', async () => {
    renderDialog({
      existingInvitations: [{ ...baseInvitation, id: 5, name: 'Charlie' }],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText(/updated · shown first/)).not.toBeInTheDocument();
  });

  it('shows combined count, updated rows before normal rows, and correct alreadyInCourse when both existingInvitations and updatedInvitations are present', async () => {
    const updatedItem: InvitationUpdatedItem = {
      id: 10,
      name: 'UpdatedAlice',
      email: 'updated@example.com',
      externalId: 'NEW001',
      previousExternalId: 'OLD001',
      role: 'student',
      phantom: false,
    };
    renderDialog({
      existingInvitations: [
        { ...baseInvitation, id: 5, name: 'NormalCharlie' },
      ],
      updatedInvitations: [updatedItem],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Existing Invitations (2)')).toBeInTheDocument();
    expect(screen.getByText('1 updated · shown first')).toBeInTheDocument();
    expect(
      screen.getByText(
        /0 new invitations sent, 0 directly enrolled, 2 already in course/,
      ),
    ).toBeInTheDocument();
    const normalRow = screen.getByText('NormalCharlie');
    const updatedRow = screen.getByText('UpdatedAlice');
    expect(
      // eslint-disable-next-line no-bitwise
      normalRow.compareDocumentPosition(updatedRow) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
  });

  // Existing Course Users section
  it('shows Existing Course Users section with name visible', async () => {
    renderDialog({
      existingCourseUsers: [{ ...baseCourseUser, id: 6, name: 'Diana' }],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Existing Course Users (1)')).toBeInTheDocument();
    expect(screen.getByText('Diana')).toBeInTheDocument();
  });

  it('hides Existing Course Users section when empty', async () => {
    renderDialog({ newInvitations: [baseInvitation] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText(/Existing Course Users/)).not.toBeInTheDocument();
  });

  it('shows updatedSubtitle for Existing Course Users when updatedCourseUsers is non-empty', async () => {
    const updatedUser = {
      id: 20,
      name: 'Dana',
      email: 'dana@example.com',
      externalId: 'CU001',
      previousExternalId: 'CU000',
      role: 'student',
      phantom: false,
    };
    renderDialog({ updatedCourseUsers: [updatedUser] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Existing Course Users (1)')).toBeInTheDocument();
    expect(screen.getByText('1 updated · shown first')).toBeInTheDocument();
  });

  it('shows combined count, updated rows before normal rows, and correct alreadyInCourse when both existingCourseUsers and updatedCourseUsers are present', async () => {
    const updatedUser = {
      id: 20,
      name: 'UpdatedDana',
      email: 'updated-dana@example.com',
      externalId: 'CU001',
      previousExternalId: 'CU000',
      role: 'student',
      phantom: false,
    };
    renderDialog({
      existingCourseUsers: [{ ...baseCourseUser, id: 6, name: 'NormalEve' }],
      updatedCourseUsers: [updatedUser],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Existing Course Users (2)')).toBeInTheDocument();
    expect(screen.getByText('1 updated · shown first')).toBeInTheDocument();
    expect(
      screen.getByText(
        /0 new invitations sent, 0 directly enrolled, 2 already in course/,
      ),
    ).toBeInTheDocument();
    const normalRow = screen.getByText('NormalEve');
    const updatedRow = screen.getByText('UpdatedDana');
    expect(
      // eslint-disable-next-line no-bitwise
      normalRow.compareDocumentPosition(updatedRow) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
  });

  describe('Personalized Timeline column (showPersonalizedTimelineFeatures)', () => {
    const storeWithTimelines = {
      invitations: {
        invitations: { ids: [], entities: {}, byId: {} },
        permissions: {
          canManageCourseUsers: false,
          canManageEnrolRequests: false,
          canManageReferenceTimelines: false,
          canManagePersonalTimes: false,
          canRegisterWithCode: false,
        },
        manageCourseUsersData: {
          requestsCount: 0,
          invitationsCount: 0,
          defaultTimelineAlgorithm: 'fixed' as const,
          showPersonalizedTimelineFeatures: true,
        },
        courseRegistrationKey: '',
      },
    };

    it('shows Personalized Timeline column in new invitations table when feature is on', async () => {
      render(
        <InvitationResultDialog
          handleClose={noop}
          invitationResult={{
            newInvitations: [{ ...baseInvitation, timelineAlgorithm: 'otot' }],
          }}
          open
        />,
        { state: storeWithTimelines },
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.getByText('Personalized Timeline')).toBeInTheDocument();
      expect(screen.getByText('Otot')).toBeInTheDocument();
    });

    it('hides Personalized Timeline column when feature is off', async () => {
      render(
        <InvitationResultDialog
          handleClose={noop}
          invitationResult={{
            newInvitations: [{ ...baseInvitation, timelineAlgorithm: 'otot' }],
          }}
          open
        />,
      );
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(
        screen.queryByText('Personalized Timeline'),
      ).not.toBeInTheDocument();
    });
  });
});
