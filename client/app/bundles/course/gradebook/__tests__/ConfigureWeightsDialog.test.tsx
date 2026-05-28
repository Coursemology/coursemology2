import { fireEvent, render, screen, waitFor } from 'test-utils';

import * as operations from '../operations';
import ConfigureWeightsDialog from '../components/ConfigureWeightsDialog';

jest
  .spyOn(operations, 'updateGradebookWeights')
  .mockReturnValue(() => Promise.resolve());

const categories = [{ id: 1, title: 'Missions' }];
const tabs = [
  { id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 50 },
  { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
];

const setup = (overrides = {}) =>
  render(
    <ConfigureWeightsDialog
      open
      onClose={jest.fn()}
      categories={categories}
      tabs={tabs}
      {...overrides}
    />,
  );

describe('<ConfigureWeightsDialog />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders one input per tab grouped by category', async () => {
    setup();
    expect(await screen.findByText('Missions')).toBeInTheDocument();
    expect(screen.getByLabelText('Assignments')).toHaveValue(50);
    expect(screen.getByLabelText('Optional')).toHaveValue(50);
  });

  it('shows Total: 100% with no warning when sum = 100', async () => {
    setup();
    expect(await screen.findByText(/Total:\s*100%/)).toBeInTheDocument();
    expect(screen.queryByText(/do not sum to 100/i)).not.toBeInTheDocument();
  });

  it('shows warning when sum != 100', async () => {
    setup();
    await screen.findByText('Missions');
    fireEvent.change(screen.getByLabelText('Optional'), {
      target: { value: '30' },
    });
    expect(screen.getByText(/Total:\s*80%/)).toBeInTheDocument();
    expect(screen.getByText(/do not sum to 100/i)).toBeInTheDocument();
  });

  it('shows inline error for >100', async () => {
    setup();
    await screen.findByText('Missions');
    fireEvent.change(screen.getByLabelText('Assignments'), {
      target: { value: '101' },
    });
    expect(screen.getByText(/must be at most 100/i)).toBeInTheDocument();
  });

  it('shows inline error for negative', async () => {
    setup();
    await screen.findByText('Missions');
    fireEvent.change(screen.getByLabelText('Optional'), {
      target: { value: '-1' },
    });
    expect(screen.getByText(/must be at least 0/i)).toBeInTheDocument();
  });

  it('Save dispatches updateGradebookWeights with current values', async () => {
    setup();
    await screen.findByText('Missions');
    fireEvent.change(screen.getByLabelText('Optional'), {
      target: { value: '40' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(operations.updateGradebookWeights).toHaveBeenCalledWith([
        { tabId: 10, weight: 50 },
        { tabId: 11, weight: 40 },
      ]);
    });
  });

  it('Cancel does not dispatch', async () => {
    setup();
    await screen.findByText('Missions');
    fireEvent.change(screen.getByLabelText('Optional'), {
      target: { value: '40' },
    });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(operations.updateGradebookWeights).not.toHaveBeenCalled();
  });
});
