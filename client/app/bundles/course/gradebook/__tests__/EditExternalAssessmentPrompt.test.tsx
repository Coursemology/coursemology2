import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from 'test-utils';

import toast from 'lib/hooks/toast';

import EditExternalAssessmentPrompt from '../components/manage/EditExternalAssessmentPrompt';
import { editExternalAssessment } from '../operations';

jest.mock('../operations', () => ({
  editExternalAssessment: jest.fn(() => (): Promise<void> => Promise.resolve()),
}));
jest.mock('lib/hooks/toast', () => ({ error: jest.fn() }));

const assessment = {
  id: -3,
  title: 'Quiz',
  tabId: -3,
  maxGrade: 20,
  external: true,
  floorAtZero: true,
  capAtMaximum: true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

it('saves the edited name and a toggled cap flag', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  const name = await screen.findByLabelText('Name');
  await userEvent.clear(name);
  await userEvent.type(name, 'Quiz 1');
  await userEvent.click(
    screen.getByRole('button', { name: /advanced settings/i }),
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Cap grades at max' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(editExternalAssessment).toHaveBeenCalledWith(-3, {
      title: 'Quiz 1',
      maximumGrade: 20,
      floorAtZero: true,
      capAtMaximum: false,
    }),
  );
}, 10000);

it('trims surrounding whitespace from the saved name', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  const name = await screen.findByLabelText('Name');
  await userEvent.clear(name);
  await userEvent.type(name, '  Quiz 2  ');
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(editExternalAssessment).toHaveBeenCalledWith(-3, {
      title: 'Quiz 2',
      maximumGrade: 20,
      floorAtZero: true,
      capAtMaximum: true,
    }),
  );
});

it('saves a toggled floor flag', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  await screen.findByLabelText('Name');
  await userEvent.click(
    screen.getByRole('button', { name: /advanced settings/i }),
  );
  fireEvent.click(screen.getByRole('checkbox', { name: 'Floor grades at 0' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(editExternalAssessment).toHaveBeenCalledWith(-3, {
      title: 'Quiz',
      maximumGrade: 20,
      floorAtZero: false,
      capAtMaximum: true,
    }),
  );
});

it('saves an edited max marks value', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  fireEvent.change(await screen.findByLabelText('Max marks'), {
    target: { value: '50' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(editExternalAssessment).toHaveBeenCalledWith(-3, {
      title: 'Quiz',
      maximumGrade: 50,
      floorAtZero: true,
      capAtMaximum: true,
    }),
  );
});

it('defaults floor and cap switches to checked when the assessment omits them', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={{
        id: -4,
        title: 'Lab',
        tabId: -4,
        maxGrade: 10,
        external: true,
      }}
      onClose={jest.fn()}
      open
    />,
  );
  await screen.findByLabelText('Name');
  await userEvent.click(
    screen.getByRole('button', { name: /advanced settings/i }),
  );
  expect(
    screen.getByRole('checkbox', { name: 'Floor grades at 0' }),
  ).toBeChecked();
  expect(
    screen.getByRole('checkbox', { name: 'Cap grades at max' }),
  ).toBeChecked();
});

it('explains the floor and cap toggles, explaining the grade is unchanged', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  await screen.findByLabelText('Name');
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
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  await screen.findByLabelText('Name');
  expect(screen.queryByLabelText('Weight')).not.toBeInTheDocument();
});

it('disables Save when the name is blank', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  const name = await screen.findByLabelText('Name');
  await userEvent.clear(name);
  await userEvent.type(name, '   ');
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});

it('disables Save when max marks is blank', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  fireEvent.change(await screen.findByLabelText('Max marks'), {
    target: { value: '' },
  });
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});

it('disables Save when max marks is negative', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  fireEvent.change(await screen.findByLabelText('Max marks'), {
    target: { value: '-5' },
  });
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});

it('calls onClose when Cancel is clicked', async () => {
  const onClose = jest.fn();
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={onClose}
      open
    />,
  );
  await screen.findByLabelText('Name');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(onClose).toHaveBeenCalled();
});

it('closes the dialog after a successful save', async () => {
  const onClose = jest.fn();
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={onClose}
      open
    />,
  );
  await screen.findByLabelText('Name');
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalled());
});

it('shows an error toast and keeps the dialog open when saving fails', async () => {
  (editExternalAssessment as jest.Mock).mockImplementationOnce(
    () => (): Promise<void> => Promise.reject(new Error('boom')),
  );
  const onClose = jest.fn();
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={onClose}
      open
    />,
  );
  await screen.findByLabelText('Name');
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(toast.error).toHaveBeenCalled());
  expect(onClose).not.toHaveBeenCalled();
});

it('hides floor/cap behind Advanced settings, collapsed by default', async () => {
  render(
    <EditExternalAssessmentPrompt
      assessment={assessment}
      onClose={jest.fn()}
      open
    />,
  );
  await screen.findByLabelText('Name');
  expect(
    screen.queryByRole('checkbox', { name: /floor grades at 0/i }),
  ).toBeNull();
  await userEvent.click(
    screen.getByRole('button', { name: /advanced settings/i }),
  );
  // The Advanced settings accordion expands via a CSS height transition, so
  // the switch isn't in the accessibility tree on the same tick the click
  // handler returns. Query by role (as above) rather than toBeVisible() —
  // MUI's Switch always sets opacity: 0 on its native input by design (the
  // visible thumb/track are separate sibling elements), so toBeVisible()
  // never passes for it regardless of the accordion's state.
  await waitFor(() =>
    expect(
      screen.getByRole('checkbox', { name: /floor grades at 0/i }),
    ).toBeInTheDocument(),
  );
});
