import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from 'test-utils';
import { InvitationFileEntity } from 'types/course/userInvitations';

import InviteUsersFileUpload from '../index';

const mockToastError = jest.fn();
const mockToastLoading = jest.fn(
  (..._args: unknown[]): string => 'loading-toast-id',
);
const mockToastDismiss = jest.fn();
const mockToastUpdate = jest.fn();
jest.mock('lib/hooks/toast', () => ({
  __esModule: true,
  default: {
    error: (...args: unknown[]): void => mockToastError(...args),
    success: jest.fn(),
    loading: (...args: unknown[]): unknown => mockToastLoading(...args),
    dismiss: (...args: unknown[]): void => mockToastDismiss(...args),
    update: (...args: unknown[]): void => mockToastUpdate(...args),
  },
}));

// Capture the onSubmit prop so we can call it directly with IFormInputs-shaped data,
// reproducing exactly what FormDialog passes at runtime.
let capturedOnSubmit:
  | ((data: { file: InvitationFileEntity }) => Promise<void>)
  | null = null;

// MockFileUploadForm must be defined inside the factory to avoid jest.mock hoisting:
// babel-jest hoists jest.mock above all module-level code, so any variable referenced
// in the factory would be undefined when the factory runs during import resolution.
jest.mock('../../../components/forms/InviteUsersFileUploadForm', () => {
  const MockFileUploadForm = ({
    open,
    onSubmit,
    formSubtitle,
  }: {
    open: boolean;
    onSubmit: (data: { file: InvitationFileEntity }) => Promise<void>;
    formSubtitle?: React.ReactNode;
  }): JSX.Element | null => {
    capturedOnSubmit = onSubmit;
    return open ? (
      <div>
        <button data-testid="mock-file-submit" type="button" />
        {formSubtitle}
      </div>
    ) : null;
  };
  MockFileUploadForm.displayName = 'MockFileUploadForm';
  return MockFileUploadForm;
});

const mockInviteUsersFromFile = jest.fn(
  (): ((_dispatch: unknown) => Promise<object>) =>
    (_dispatch: unknown): Promise<object> =>
      Promise.resolve({
        newInvitations: [],
        existingInvitations: [],
        newCourseUsers: [],
        existingCourseUsers: [],
        failedUsers: [],
        updatedInvitations: [],
        updatedCourseUsers: [],
      }),
);

jest.mock('../../../operations', () => ({
  inviteUsersFromFile: (...args: unknown[]): unknown =>
    (mockInviteUsersFromFile as (...a: unknown[]) => unknown)(...args),
  fetchInvitations: jest.fn(
    (): (() => Promise<void>) => (): Promise<void> => Promise.resolve(),
  ),
  fetchPermissionsAndSharedData: jest.fn(
    (): (() => Promise<void>) => (): Promise<void> => Promise.resolve(),
  ),
}));

const MOCK_FILE_SUBMIT_TESTID = 'mock-file-submit';
const CONFLICT_PROMPT_TITLE = 'Confirm External ID Updates';
const KEEP_EXISTING_BUTTON = 'Keep Existing';

const TEST_FILE_ENTITY: InvitationFileEntity = {
  name: 'invites.csv',
  url: 'blob:http://localhost/test-123',
  file: new Blob(['Name,Email\nAlice,alice@test.com'], { type: 'text/csv' }),
};

const conflictResponse = {
  conflict: {
    pendingInvitationUpdates: [
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
    pendingCourseUserUpdates: [],
  },
};

const successResponse = {
  newInvitations: [],
  existingInvitations: [],
  newCourseUsers: [],
  existingCourseUsers: [],
  failedUsers: [],
  updatedInvitations: [],
  updatedCourseUsers: [],
};

const storeWithPersonalTimes = {
  invitations: {
    invitations: { ids: [], entities: {}, byId: {} },
    permissions: {
      canManageCourseUsers: false,
      canManageEnrolRequests: false,
      canManageReferenceTimelines: false,
      canManagePersonalTimes: true,
      canRegisterWithCode: false,
    },
    manageCourseUsersData: {
      requestsCount: 0,
      invitationsCount: 0,
      defaultTimelineAlgorithm: 'fixed' as const,
      showPersonalizedTimelineFeatures: false,
    },
    courseRegistrationKey: '',
  },
};

const noop = jest.fn();

describe('<InviteUsersFileUpload />', () => {
  beforeEach(() => {
    capturedOnSubmit = null;
    mockInviteUsersFromFile.mockClear();
    mockToastError.mockClear();
    mockToastLoading.mockClear();
    mockToastDismiss.mockClear();
    mockToastUpdate.mockClear();
    noop.mockClear();
  });

  it('renders nothing when open is false', () => {
    render(
      <InviteUsersFileUpload
        onClose={noop}
        open={false}
        openResultDialog={noop}
      />,
    );
    expect(
      screen.queryByTestId(MOCK_FILE_SUBMIT_TESTID),
    ).not.toBeInTheDocument();
  });

  it('passes InvitationFileEntity (not the IFormInputs wrapper) to inviteUsersFromFile', async () => {
    render(
      <InviteUsersFileUpload
        onClose={jest.fn()}
        open
        openResultDialog={jest.fn()}
      />,
    );

    await waitFor(() =>
      expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
    );
    expect(capturedOnSubmit).not.toBeNull();

    // Simulate what FormDialog passes: the full IFormInputs wrapper { file: InvitationFileEntity }
    await capturedOnSubmit!({ file: TEST_FILE_ENTITY });

    expect(mockInviteUsersFromFile).toHaveBeenCalledTimes(1);
    const firstArg = (
      mockInviteUsersFromFile.mock.calls as unknown[][]
    )[0][0] as InvitationFileEntity;

    // Regression guard: the page must extract .file from the IFormInputs wrapper.
    // If the bug regresses, firstArg would be { file: InvitationFileEntity } and
    // firstArg.name would be undefined.
    expect(firstArg.name).toBe('invites.csv');
    expect(firstArg.file).toBeInstanceOf(Blob);
  });

  it('toasts an error and does not import when submitted without a file', async () => {
    render(
      <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
    );
    await waitFor(() =>
      expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
    );

    // Reproduces the select-then-remove state: dirty form, but no Blob.
    await capturedOnSubmit!({ file: { name: '', url: '', file: undefined } });

    expect(mockToastError).toHaveBeenCalledWith(
      'Please select a CSV file to upload.',
    );
    expect(mockInviteUsersFromFile).not.toHaveBeenCalled();
  });

  it('shows ExternalIdConflictPrompt when server returns a conflict', async () => {
    mockInviteUsersFromFile.mockImplementationOnce(
      () =>
        (_dispatch: unknown): Promise<object> =>
          Promise.resolve(conflictResponse),
    );

    render(
      <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
    );
    await waitFor(() =>
      expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
    );

    await capturedOnSubmit!({ file: TEST_FILE_ENTITY });

    await waitFor(() =>
      expect(screen.getByText(CONFLICT_PROMPT_TITLE)).toBeInTheDocument(),
    );
  });

  it('calls openResultDialog and onClose on successful upload', async () => {
    const openResultDialog = jest.fn();
    const onClose = jest.fn();

    render(
      <InviteUsersFileUpload
        onClose={onClose}
        open
        openResultDialog={openResultDialog}
      />,
    );
    await waitFor(() =>
      expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
    );

    await capturedOnSubmit!({ file: TEST_FILE_ENTITY });

    expect(openResultDialog).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows error toast with first error and overflow count when response has array of errors', async () => {
    mockInviteUsersFromFile.mockImplementationOnce(
      () =>
        (_dispatch: unknown): Promise<object> =>
          Promise.reject(
            Object.assign(new Error('Upload failed'), {
              response: {
                data: { errors: ['Header mismatch', 'Second error'] },
              },
            }),
          ),
    );

    render(
      <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
    );
    await waitFor(() =>
      expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
    );

    await capturedOnSubmit!({ file: TEST_FILE_ENTITY });

    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining('Header mismatch (and 1 more)'),
      expect.anything(),
    );
  });

  it('shows generic error toast when response has no recognized errors', async () => {
    mockInviteUsersFromFile.mockImplementationOnce(
      () =>
        (_dispatch: unknown): Promise<object> =>
          Promise.reject(
            Object.assign(new Error('Upload failed'), {
              response: { data: {} },
            }),
          ),
    );

    render(
      <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
    );
    await waitFor(() =>
      expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
    );

    await capturedOnSubmit!({ file: TEST_FILE_ENTITY });

    await waitFor(() => expect(mockToastError).toHaveBeenCalled());
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining(
        'Failed to invite users. Please ensure your data is formatted correctly.',
      ),
      expect.anything(),
    );
  });

  describe('personal timeline hint', () => {
    it('shows personal timeline bullet when canManagePersonalTimes is true', async () => {
      render(
        <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
        { state: storeWithPersonalTimes },
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );
      expect(screen.getByText(/Personal Timelines can be/)).toBeInTheDocument();
    });

    it('hides personal timeline bullet when canManagePersonalTimes is false', async () => {
      render(
        <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );
      expect(
        screen.queryByText(/Personal Timelines can be/),
      ).not.toBeInTheDocument();
    });

    it('shows 6-col example when canManagePersonalTimes is true', async () => {
      render(
        <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
        { state: storeWithPersonalTimes },
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );
      expect(
        screen.getByText(
          /Name,Email,External ID,Role,Phantom,Personal Timeline/,
        ),
      ).toBeInTheDocument();
    });

    it('shows 5-col example when canManagePersonalTimes is false', async () => {
      render(
        <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );
      const preEl = document.querySelector('pre');
      expect(preEl?.textContent).toContain(
        'Name,Email,External ID,Role,Phantom',
      );
      expect(preEl?.textContent).not.toContain('Personal Timeline');
    });
  });

  describe('conflict resolution', () => {
    const setupConflict = async (): Promise<void> => {
      mockInviteUsersFromFile.mockImplementationOnce(
        () =>
          (_dispatch: unknown): Promise<object> =>
            Promise.resolve(conflictResponse),
      );
      mockInviteUsersFromFile.mockImplementationOnce(
        () =>
          (_dispatch: unknown): Promise<object> =>
            Promise.resolve(successResponse),
      );

      render(
        <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );
      await capturedOnSubmit!({ file: TEST_FILE_ENTITY });
      await waitFor(() =>
        expect(screen.getByText(CONFLICT_PROMPT_TITLE)).toBeInTheDocument(),
      );
    };

    it('passes keep_existing resolution when Keep Existing is clicked', async () => {
      await setupConflict();
      await userEvent.click(
        screen.getByRole('button', { name: KEEP_EXISTING_BUTTON }),
      );
      expect(mockInviteUsersFromFile).toHaveBeenCalledTimes(2);
      expect((mockInviteUsersFromFile.mock.calls as unknown[][])[1][1]).toBe(
        'keep_existing',
      );
    });

    it('passes replace_all resolution when Replace is clicked', async () => {
      await setupConflict();
      await userEvent.click(screen.getByRole('button', { name: 'Replace' }));
      expect(mockInviteUsersFromFile).toHaveBeenCalledTimes(2);
      expect((mockInviteUsersFromFile.mock.calls as unknown[][])[1][1]).toBe(
        'replace_all',
      );
    });
  });

  describe('import progress feedback', () => {
    it('shows a loading toast while the initial upload is in progress', async () => {
      render(
        <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );

      await capturedOnSubmit!({ file: TEST_FILE_ENTITY });

      expect(mockToastLoading).toHaveBeenCalledTimes(1);
    });

    it('dismisses the loading toast after a successful upload', async () => {
      render(
        <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );

      await capturedOnSubmit!({ file: TEST_FILE_ENTITY });

      expect(mockToastDismiss).toHaveBeenCalledWith('loading-toast-id');
    });

    it('dismisses the loading toast when the upload fails', async () => {
      mockInviteUsersFromFile.mockImplementationOnce(
        () =>
          (_dispatch: unknown): Promise<object> =>
            Promise.reject(
              Object.assign(new Error('Upload failed'), {
                response: { data: {} },
              }),
            ),
      );

      render(
        <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );

      await capturedOnSubmit!({ file: TEST_FILE_ENTITY });

      await waitFor(() => expect(mockToastError).toHaveBeenCalled());
      expect(mockToastDismiss).toHaveBeenCalledWith('loading-toast-id');
    });
  });

  describe('conflict resolution keeps the prompt open', () => {
    const deferred = (): {
      promise: Promise<object>;
      resolve: (value: object) => void;
    } => {
      let resolve!: (value: object) => void;
      const promise = new Promise<object>((res) => {
        resolve = res;
      });
      return { promise, resolve };
    };

    // First submit returns a conflict; the resolution submit stays pending so we
    // can assert what the UI looks like *during* the import wait.
    const setupPendingResolution = async (): Promise<{
      resolve: (value: object) => void;
    }> => {
      const pending = deferred();
      mockInviteUsersFromFile.mockImplementationOnce(
        () =>
          (_dispatch: unknown): Promise<object> =>
            Promise.resolve(conflictResponse),
      );
      mockInviteUsersFromFile.mockImplementationOnce(
        () =>
          (_dispatch: unknown): Promise<object> =>
            pending.promise,
      );

      render(
        <InviteUsersFileUpload onClose={noop} open openResultDialog={noop} />,
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );
      await capturedOnSubmit!({ file: TEST_FILE_ENTITY });
      await waitFor(() =>
        expect(screen.getByText(CONFLICT_PROMPT_TITLE)).toBeInTheDocument(),
      );
      return pending;
    };

    it('does not reopen the upload form while the resolution is in progress', async () => {
      await setupPendingResolution();

      await userEvent.click(
        screen.getByRole('button', { name: KEEP_EXISTING_BUTTON }),
      );

      // The prompt must remain; the original upload form must NOT reappear.
      expect(screen.getByText(CONFLICT_PROMPT_TITLE)).toBeInTheDocument();
      expect(
        screen.queryByTestId(MOCK_FILE_SUBMIT_TESTID),
      ).not.toBeInTheDocument();
    });

    it('disables the conflict prompt buttons while the resolution is in progress', async () => {
      await setupPendingResolution();

      await userEvent.click(
        screen.getByRole('button', { name: KEEP_EXISTING_BUTTON }),
      );

      expect(
        screen.getByRole('button', { name: KEEP_EXISTING_BUTTON }),
      ).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Replace' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Go Back' })).toBeDisabled();
    });

    it('shows a loading toast when resolving a conflict', async () => {
      await setupPendingResolution();
      mockToastLoading.mockClear();

      await userEvent.click(
        screen.getByRole('button', { name: KEEP_EXISTING_BUTTON }),
      );

      expect(mockToastLoading).toHaveBeenCalledTimes(1);
    });

    it('closes the prompt and opens the result dialog once resolution succeeds', async () => {
      const openResultDialog = jest.fn();
      const onClose = jest.fn();
      const pending = deferred();
      mockInviteUsersFromFile.mockImplementationOnce(
        () =>
          (_dispatch: unknown): Promise<object> =>
            Promise.resolve(conflictResponse),
      );
      mockInviteUsersFromFile.mockImplementationOnce(
        () =>
          (_dispatch: unknown): Promise<object> =>
            pending.promise,
      );

      render(
        <InviteUsersFileUpload
          onClose={onClose}
          open
          openResultDialog={openResultDialog}
        />,
      );
      await waitFor(() =>
        expect(screen.getByTestId(MOCK_FILE_SUBMIT_TESTID)).toBeInTheDocument(),
      );
      await capturedOnSubmit!({ file: TEST_FILE_ENTITY });
      await waitFor(() =>
        expect(screen.getByText(CONFLICT_PROMPT_TITLE)).toBeInTheDocument(),
      );

      await userEvent.click(
        screen.getByRole('button', { name: KEEP_EXISTING_BUTTON }),
      );
      pending.resolve(successResponse);

      await waitFor(() => expect(openResultDialog).toHaveBeenCalledTimes(1));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(mockToastDismiss).toHaveBeenCalledWith('loading-toast-id');
    });
  });
});
