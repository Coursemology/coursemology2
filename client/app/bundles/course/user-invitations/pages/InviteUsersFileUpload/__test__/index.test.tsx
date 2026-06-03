import { render, screen, waitFor } from 'test-utils';
import { InvitationFileEntity } from 'types/course/userInvitations';

import InviteUsersFileUpload from '../index';

// Capture the onSubmit prop so we can call it directly with IFormInputs-shaped data,
// reproducing exactly what FormDialog passes at runtime.
let capturedOnSubmit:
  | ((data: { file: InvitationFileEntity }) => Promise<void>)
  | null = null;

const MockFileUploadForm = ({
  open,
  onSubmit,
}: {
  open: boolean;
  onSubmit: (data: { file: InvitationFileEntity }) => Promise<void>;
}): JSX.Element | null => {
  capturedOnSubmit = onSubmit;
  return open ? <button data-testid="mock-file-submit" type="button" /> : null;
};
MockFileUploadForm.displayName = 'MockFileUploadForm';

jest.mock(
  '../../../components/forms/InviteUsersFileUploadForm',
  () => MockFileUploadForm,
);

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
    mockInviteUsersFromFile(...args),
  fetchInvitations: jest.fn(
    (): (() => Promise<void>) => (): Promise<void> => Promise.resolve(),
  ),
  fetchPermissionsAndSharedData: jest.fn(
    (): (() => Promise<void>) => (): Promise<void> => Promise.resolve(),
  ),
}));

const TEST_FILE_ENTITY: InvitationFileEntity = {
  name: 'invites.csv',
  url: 'blob:http://localhost/test-123',
  file: new Blob(['Name,Email\nAlice,alice@test.com'], { type: 'text/csv' }),
};

describe('<InviteUsersFileUpload />', () => {
  beforeEach(() => {
    capturedOnSubmit = null;
    mockInviteUsersFromFile.mockClear();
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
      expect(screen.getByTestId('mock-file-submit')).toBeInTheDocument(),
    );
    expect(capturedOnSubmit).not.toBeNull();

    // Simulate what FormDialog passes: the full IFormInputs wrapper { file: InvitationFileEntity }
    await capturedOnSubmit!({ file: TEST_FILE_ENTITY });

    expect(mockInviteUsersFromFile).toHaveBeenCalledTimes(1);
    const firstArg = mockInviteUsersFromFile.mock
      .calls[0][0] as InvitationFileEntity;

    // Regression guard: the page must extract .file from the IFormInputs wrapper.
    // If the bug regresses, firstArg would be { file: InvitationFileEntity } and
    // firstArg.name would be undefined.
    expect(firstArg.name).toBe('invites.csv');
    expect(firstArg.file).toBeInstanceOf(Blob);
  });
});
