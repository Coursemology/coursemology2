import React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved } from 'test-utils';
import { CourseUserData } from 'types/course/courseUsers';
import {
  FailedInvitationRowData,
  InvitationListData,
  InvitationResult,
  InvitationUpdatedItem,
} from 'types/course/userInvitations';

import * as operations from '../../../operations';
import InvitationResultDialog from '../InvitationResultDialog';

jest.mock('../../../operations', () => ({
  ...jest.requireActual('../../../operations'),
  updateExternalIds: jest.fn(),
}));

const CAROL_EMAIL = 'carol@example.com';
const EXT_ID_UPDATES_1 = 'External IDs to update (1)';

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

  it('does not close when backdrop is clicked', async () => {
    const handleClose = jest.fn();
    render(
      <InvitationResultDialog
        handleClose={handleClose}
        invitationResult={{}}
        open
      />,
    );
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) fireEvent.click(backdrop);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(handleClose).not.toHaveBeenCalled();
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

  it('hides Existing Invitations section when both existingInvitations and pendingInvitationUpdates are empty', async () => {
    renderDialog({ newInvitations: [baseInvitation] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.queryByText(/Existing Invitations/)).not.toBeInTheDocument();
  });

  it('shows pending invitation diffs in the dedicated section, not Existing Invitations', async () => {
    const pendingItem: InvitationUpdatedItem = {
      id: 10,
      name: 'Carol',
      email: CAROL_EMAIL,
      externalId: 'NEW001',
      previousExternalId: 'OLD001',
      role: 'student',
      phantom: false,
    };
    renderDialog({ pendingInvitationUpdates: [pendingItem] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText(EXT_ID_UPDATES_1)).toBeInTheDocument();
    expect(screen.getByText('Invitations (1)')).toBeInTheDocument();
    expect(screen.queryByText(/Existing Invitations/)).not.toBeInTheDocument();
    expect(screen.getByText('Carol')).toBeInTheDocument();
  });

  it('splits pending invitation diffs out of Existing Invitations but still counts them as already in course', async () => {
    const pendingItem: InvitationUpdatedItem = {
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
      pendingInvitationUpdates: [pendingItem],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Existing Invitations (1)')).toBeInTheDocument();
    expect(screen.getByText(EXT_ID_UPDATES_1)).toBeInTheDocument();
    expect(screen.getByText('Invitations (1)')).toBeInTheDocument();
    expect(
      screen.getByText(
        /0 new invitations sent, 0 directly enrolled, 2 already in course/,
      ),
    ).toBeInTheDocument();
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

  it('shows pending course-user diffs in the dedicated section, not Existing Course Users', async () => {
    const pendingUser: InvitationUpdatedItem = {
      id: 20,
      name: 'Dana',
      email: 'dana@example.com',
      externalId: 'CU001',
      previousExternalId: 'CU000',
      role: 'student',
      phantom: false,
    };
    renderDialog({ pendingCourseUserUpdates: [pendingUser] });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText(EXT_ID_UPDATES_1)).toBeInTheDocument();
    expect(screen.getByText('Enrolled members (1)')).toBeInTheDocument();
    expect(screen.queryByText(/Existing Course Users/)).not.toBeInTheDocument();
    expect(screen.getByText('Dana')).toBeInTheDocument();
  });

  it('splits pending course-user diffs out of Existing Course Users but still counts them as already in course', async () => {
    const pendingUser: InvitationUpdatedItem = {
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
      pendingCourseUserUpdates: [pendingUser],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('Existing Course Users (1)')).toBeInTheDocument();
    expect(screen.getByText(EXT_ID_UPDATES_1)).toBeInTheDocument();
    expect(screen.getByText('Enrolled members (1)')).toBeInTheDocument();
    expect(
      screen.getByText(
        /0 new invitations sent, 0 directly enrolled, 2 already in course/,
      ),
    ).toBeInTheDocument();
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

  it('renders External IDs to update before New Invitations in DOM', async () => {
    renderDialog({
      newInvitations: [baseInvitation],
      pendingInvitationUpdates: [
        {
          id: 10,
          name: 'PendingPat',
          email: 'pat@example.com',
          externalId: 'NEW001',
          previousExternalId: 'OLD001',
          role: 'student',
          phantom: false,
        },
      ],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    const headings = screen
      .getAllByRole('heading')
      .map((h) => h.textContent ?? '');
    const updIdx = headings.findIndex((h) => h.includes('External IDs to update'));
    const newInvIdx = headings.findIndex((h) => h.includes('New Invitations'));
    expect(updIdx).toBeGreaterThanOrEqual(0);
    expect(newInvIdx).toBeGreaterThanOrEqual(0);
    expect(updIdx).toBeLessThan(newInvIdx);
  });

  it('shows a single combined count and both sub-tables when both arrays are non-empty', async () => {
    renderDialog({
      pendingInvitationUpdates: [
        {
          id: 10,
          name: 'PendingPat',
          email: 'pat@example.com',
          externalId: 'NEW001',
          previousExternalId: 'OLD001',
          role: 'student',
          phantom: false,
        },
      ],
      pendingCourseUserUpdates: [
        {
          id: 20,
          name: 'PendingDana',
          email: 'dana@example.com',
          externalId: 'CU001',
          previousExternalId: 'CU000',
          role: 'student',
          phantom: false,
        },
      ],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    expect(screen.getByText('External IDs to update (2)')).toBeInTheDocument();
    expect(screen.getByText('Invitations (1)')).toBeInTheDocument();
    expect(screen.getByText('Enrolled members (1)')).toBeInTheDocument();
    expect(screen.getByText('PendingPat')).toBeInTheDocument();
    expect(screen.getByText('PendingDana')).toBeInTheDocument();
  });

  it('exposes the keep-by-default explanation as a tooltip on the section', async () => {
    renderDialog({
      pendingInvitationUpdates: [
        {
          id: 10,
          name: 'PendingPat',
          email: 'pat@example.com',
          externalId: 'NEW001',
          previousExternalId: 'OLD001',
          role: 'student',
          phantom: false,
        },
      ],
    });
    await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
    // Tooltip text is rendered (in the accessible tree) by MUI's Tooltip title prop.
    expect(
      screen.getByLabelText(
        'These users are already invited or enrolled. Their External ID changes only if you apply the file values.',
      ),
    ).toBeInTheDocument();
  });

  describe('pending external-ID apply', () => {
    const pendingResult: InvitationResult = {
      pendingCourseUserUpdates: [
        {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          externalId: 'NEW001',
          previousExternalId: 'OLD001',
          role: 'student',
          phantom: false,
        },
      ],
    };

    beforeEach(() => {
      (operations.updateExternalIds as jest.Mock).mockReturnValue(
        async () => undefined,
      );
    });

    it('shows the flagged status line and Apply button when diffs exist', async () => {
      renderDialog(pendingResult);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(
        screen.getByText(/1 row has a different External ID/),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Apply changes \(1\)/ }),
      ).toBeInTheDocument();
      expect(screen.getByText(EXT_ID_UPDATES_1)).toBeInTheDocument();
      expect(screen.getByText('Enrolled members (1)')).toBeInTheDocument();
    });

    it('calls backend with file values, shows Changes applied button disabled and updated status line', async () => {
      const user = userEvent.setup();
      renderDialog(pendingResult);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      await user.click(
        screen.getByRole('button', { name: /Apply changes \(1\)/ }),
      );

      expect(operations.updateExternalIds).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'course_user',
            id: 1,
            externalId: 'NEW001',
          }),
        ]),
      );
      expect(
        screen.getByText(/External IDs were updated from your file/),
      ).toBeInTheDocument();
      const changesAppliedBtn = screen.getByRole('button', {
        name: /Changes applied/,
      });
      expect(changesAppliedBtn).toBeInTheDocument();
      expect(changesAppliedBtn).toBeDisabled();
    });

    it('shows no Apply affordance or pending-diff status text when there are no diffs', async () => {
      renderDialog({ newInvitations: [baseInvitation] });
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(
        screen.queryByRole('button', { name: /Apply changes/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/different External ID/),
      ).not.toBeInTheDocument();
    });

    it('on apply failure shows error toast and leaves button at Apply', async () => {
      (operations.updateExternalIds as jest.Mock).mockReturnValue(async () => {
        throw Object.assign(new Error('conflict'), {
          response: { data: { conflictingExternalId: 'TAKEN' } },
        });
      });

      const user = userEvent.setup();
      renderDialog(pendingResult);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      await user.click(
        screen.getByRole('button', { name: /Apply changes \(1\)/ }),
      );

      expect(
        screen.getByRole('button', { name: /Apply changes \(1\)/ }),
      ).toBeInTheDocument();
      await screen.findByText(
        /External ID 'TAKEN' is now used by another member/,
      );
    });

    it('disables Apply button while request is in flight', async () => {
      let resolveFn!: () => void;
      const pending = new Promise<void>((res) => {
        resolveFn = res;
      });
      (operations.updateExternalIds as jest.Mock).mockReturnValue(() => pending);

      const user = userEvent.setup();
      renderDialog(pendingResult);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      const applyBtn = screen.getByRole('button', { name: /Apply changes \(1\)/ });
      const clickPromise = user.click(applyBtn);
      await waitFor(() => expect(applyBtn).toBeDisabled());

      resolveFn();
      await clickPromise;
      expect(
        screen.getByRole('button', { name: /Changes applied/ }),
      ).toBeDisabled();
    });

    it('resets to Apply button when dialog closes and reopens', async () => {
      const user = userEvent.setup();

      const ToggleWrapper: React.FC = () => {
        const [open, setOpen] = React.useState(true);
        return (
          <>
            <button onClick={() => setOpen(false)}>close</button>
            <button onClick={() => setOpen(true)}>reopen</button>
            <InvitationResultDialog
              handleClose={noop}
              invitationResult={pendingResult}
              open={open}
            />
          </>
        );
      };

      render(<ToggleWrapper />);
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));

      await user.click(screen.getByRole('button', { name: /Apply changes \(1\)/ }));
      expect(
        screen.getByRole('button', { name: /Changes applied/ }),
      ).toBeDisabled();

      // These buttons are inside the aria-hidden backdrop; use fireEvent to bypass the a11y filter.
      fireEvent.click(screen.getByRole('button', { name: 'close', hidden: true }));
      fireEvent.click(screen.getByRole('button', { name: 'reopen', hidden: true }));

      await waitFor(
        () =>
          expect(
            screen.getByRole('button', { name: /Apply changes \(1\)/ }),
          ).not.toBeDisabled(),
        { timeout: 5000 },
      );
    });

    it('renders no dedicated diff section when there are no diffs', async () => {
      renderDialog({ newInvitations: [baseInvitation] });
      await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
      expect(screen.queryByText(/External IDs to update/)).not.toBeInTheDocument();
    });
  });
});
