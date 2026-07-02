import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from 'test-utils';

import toast from 'lib/hooks/toast';

import DeleteExternalColumnPrompt from '../components/DeleteExternalColumnPrompt';
import { deleteExternalAssessment } from '../operations';

jest.mock('../operations', () => ({
  __esModule: true,
  ...jest.requireActual('../operations'),
  deleteExternalAssessment: jest.fn(),
}));

jest.mock('lib/hooks/toast', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}));

const mockDelete = deleteExternalAssessment as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;

const baseProps = {
  open: true,
  assessmentId: -1,
  title: 'Quiz 2',
  onClose: jest.fn(),
};

afterEach(() => jest.clearAllMocks());

it('renders nothing when closed', () => {
  render(<DeleteExternalColumnPrompt {...baseProps} open={false} />);

  expect(
    screen.queryByRole('button', { name: 'Delete' }),
  ).not.toBeInTheDocument();
});

it('shows a loading spinner on the delete button while the deletion is in flight', async () => {
  let resolveDelete: () => void = () => {};
  mockDelete.mockReturnValue(
    () =>
      new Promise<void>((resolve) => {
        resolveDelete = resolve;
      }),
  );

  render(<DeleteExternalColumnPrompt {...baseProps} />);

  await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));

  // While the request is pending, the delete button shows its loading state.
  expect(await screen.findByRole('progressbar')).toBeInTheDocument();

  resolveDelete();
  await waitFor(() => expect(baseProps.onClose).toHaveBeenCalled());
});

it('dispatches the delete operation with the assessment id on confirm', async () => {
  mockDelete.mockReturnValue(() => Promise.resolve());

  render(<DeleteExternalColumnPrompt {...baseProps} />);

  await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));

  await waitFor(() =>
    expect(mockDelete).toHaveBeenCalledWith(baseProps.assessmentId),
  );
  await waitFor(() => expect(baseProps.onClose).toHaveBeenCalled());
});

it('toasts an error and keeps the dialog open when the delete fails', async () => {
  mockDelete.mockReturnValue(() => Promise.reject(new Error('boom')));

  render(<DeleteExternalColumnPrompt {...baseProps} />);

  await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));

  await waitFor(() => expect(mockToast.error).toHaveBeenCalled());
  expect(baseProps.onClose).not.toHaveBeenCalled();
  // finally{} resets saving → confirm button leaves its loading state.
  await waitFor(() =>
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(),
  );
});

it('closes without deleting when Cancel is clicked', async () => {
  render(<DeleteExternalColumnPrompt {...baseProps} />);

  await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

  expect(baseProps.onClose).toHaveBeenCalled();
  expect(mockDelete).not.toHaveBeenCalled();
});

it('names the assessment being deleted in the confirmation body', async () => {
  render(<DeleteExternalColumnPrompt {...baseProps} />);

  expect(await screen.findByText(/Delete "Quiz 2"\?/)).toBeInTheDocument();
});
