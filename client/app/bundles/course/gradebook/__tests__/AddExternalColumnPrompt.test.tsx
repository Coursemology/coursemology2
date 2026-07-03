import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from 'test-utils';

import AddExternalColumnPrompt from '../components/AddExternalColumnPrompt';
import { createExternalAssessment } from '../operations';

jest.mock('../operations', () => ({
  createExternalAssessment: jest.fn(
    () => (): Promise<void> => Promise.resolve(),
  ),
}));

afterEach(() => {
  jest.clearAllMocks();
});

it('submits with both bound flags on by default', async () => {
  render(<AddExternalColumnPrompt onClose={jest.fn()} open />);
  // Wait for the Dialog to render (i18n loading)
  await waitFor(() => screen.getByLabelText('Name'));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Midterm' },
  });
  fireEvent.change(screen.getByLabelText('Max marks'), {
    target: { value: '50' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() =>
    expect(createExternalAssessment).toHaveBeenCalledWith(
      'Midterm',
      50,
      true,
      true,
    ),
  );
});

it('submits floorAtZero false when the floor toggle is switched off', async () => {
  render(<AddExternalColumnPrompt onClose={jest.fn()} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Midterm' },
  });
  fireEvent.change(screen.getByLabelText('Max marks'), {
    target: { value: '50' },
  });
  await userEvent.click(
    screen.getByRole('button', { name: /advanced settings/i }),
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Floor grades at 0' }));
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() =>
    expect(createExternalAssessment).toHaveBeenCalledWith(
      'Midterm',
      50,
      false,
      true,
    ),
  );
});

it('submits capAtMaximum false when the cap toggle is switched off', async () => {
  render(<AddExternalColumnPrompt onClose={jest.fn()} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Midterm' },
  });
  fireEvent.change(screen.getByLabelText('Max marks'), {
    target: { value: '50' },
  });
  await userEvent.click(
    screen.getByRole('button', { name: /advanced settings/i }),
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Cap grades at max' }));
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() =>
    expect(createExternalAssessment).toHaveBeenCalledWith(
      'Midterm',
      50,
      true,
      false,
    ),
  );
});

it('disables Create when the name is blank', async () => {
  render(<AddExternalColumnPrompt onClose={jest.fn()} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  fireEvent.change(screen.getByLabelText('Max marks'), {
    target: { value: '50' },
  });
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
});

it('disables Create when max marks is blank', async () => {
  render(<AddExternalColumnPrompt onClose={jest.fn()} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Midterm' },
  });
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
});

it('disables Create when max marks is negative', async () => {
  render(<AddExternalColumnPrompt onClose={jest.fn()} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Midterm' },
  });
  fireEvent.change(screen.getByLabelText('Max marks'), {
    target: { value: '-5' },
  });
  expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
});

it('closes the dialog after a successful create', async () => {
  const onClose = jest.fn();
  render(<AddExternalColumnPrompt onClose={onClose} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Midterm' },
  });
  fireEvent.change(screen.getByLabelText('Max marks'), {
    target: { value: '50' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() => expect(onClose).toHaveBeenCalled());
});

it('keeps the dialog open when create fails', async () => {
  (createExternalAssessment as jest.Mock).mockReturnValueOnce(() =>
    Promise.reject(new Error('boom')),
  );
  const onClose = jest.fn();
  render(<AddExternalColumnPrompt onClose={onClose} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'Midterm' },
  });
  fireEvent.change(screen.getByLabelText('Max marks'), {
    target: { value: '50' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  await waitFor(() => expect(createExternalAssessment).toHaveBeenCalled());
  expect(onClose).not.toHaveBeenCalled();
});

it('explains the floor and cap toggles, stressing the grade is unchanged', async () => {
  render(<AddExternalColumnPrompt onClose={jest.fn()} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  await userEvent.click(
    screen.getByRole('button', { name: /advanced settings/i }),
  );
  expect(
    screen.getByLabelText(
      /Counts negative grades as 0 when computing the weighted total, and marks them with a warning in the gradebook. The actual grade is unchanged./i,
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText(
      /Counts grades above the maximum as the maximum when computing the weighted total, and marks them with a warning in the gradebook. The actual grade is unchanged./i,
    ),
  ).toBeInTheDocument();
});

it('never renders a weight field (weight lives in the Weights tab)', async () => {
  render(<AddExternalColumnPrompt onClose={jest.fn()} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  expect(screen.queryByLabelText('Weight')).not.toBeInTheDocument();
});

it('hides floor/cap behind Advanced settings, collapsed by default', async () => {
  render(<AddExternalColumnPrompt onClose={jest.fn()} open />);
  await waitFor(() => screen.getByLabelText('Name'));
  expect(
    screen.queryByRole('checkbox', { name: /floor grades at 0/i }),
  ).toBeNull();
  await userEvent.click(
    screen.getByRole('button', { name: /advanced settings/i }),
  );
  expect(screen.getByLabelText(/floor grades at 0/i)).toBeInTheDocument();
});
