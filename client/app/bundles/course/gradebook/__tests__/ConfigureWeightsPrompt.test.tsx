import { fireEvent, render, screen, waitFor } from 'test-utils';

import ConfigureWeightsPrompt from '../components/ConfigureWeightsPrompt';
import * as operations from '../operations';

jest
  .spyOn(operations, 'updateGradebookWeights')
  .mockReturnValue(async () => {});

const categories = [{ id: 1, title: 'Missions' }];
const tabs = [
  { id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 50 },
  { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
];
const assessments = [
  { id: 101, title: 'Assignment 1', tabId: 10, maxGrade: 100 },
  { id: 102, title: 'Assignment 2', tabId: 10, maxGrade: 100 },
];

const setup = (overrides = {}): ReturnType<typeof render> =>
  render(
    <ConfigureWeightsPrompt
      assessments={assessments}
      categories={categories}
      onClose={jest.fn()}
      open
      tabs={tabs}
      {...overrides}
    />,
  );

describe('<ConfigureWeightsPrompt />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders one input per tab grouped by category', () => {
    setup();
    expect(screen.getByText('Missions')).toBeInTheDocument();
    expect(screen.getByLabelText('Assignments')).toHaveValue(50);
    expect(screen.getByLabelText('Optional')).toHaveValue(50);
  });

  it('shows Total: 100% with no warning when sum = 100', () => {
    setup();
    expect(screen.getByText(/Total:\s*100%/)).toBeInTheDocument();
    expect(screen.queryByText(/do not sum to 100/i)).not.toBeInTheDocument();
  });

  it('shows warning when sum != 100', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Optional'), {
      target: { value: '30' },
    });
    expect(screen.getByText(/Total:\s*80%/)).toBeInTheDocument();
    expect(screen.getByText(/do not sum to 100/i)).toBeInTheDocument();
  });

  it('shows inline error for >100', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Assignments'), {
      target: { value: '101' },
    });
    expect(screen.getByText(/must be at most 100/i)).toBeInTheDocument();
  });

  it('shows inline error for negative', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Optional'), {
      target: { value: '-1' },
    });
    expect(screen.getByText(/must be at least 0/i)).toBeInTheDocument();
  });

  it('Save dispatches updateGradebookWeights with { tabId, weight } only', async () => {
    setup();
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

  it('Cancel does not dispatch', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Optional'), {
      target: { value: '40' },
    });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(operations.updateGradebookWeights).not.toHaveBeenCalled();
  });

  it('assessment list is hidden by default and shown on expand', () => {
    setup();
    expect(screen.queryByText('Assignment 1')).not.toBeVisible();
    const expandBtns = screen.getAllByRole('button', { name: '' });
    fireEvent.click(expandBtns[0]);
    expect(screen.getByText('Assignment 1')).toBeVisible();
    expect(screen.getByText('Assignment 2')).toBeVisible();
  });

  it('shows derived % of grade that updates live when weight changes', () => {
    setup();
    const expandBtns = screen.getAllByRole('button', { name: '' });
    fireEvent.click(expandBtns[0]);
    // weight=50, each assessment is 50% of tab → 25.0% of grade each
    expect(screen.getAllByText('25.0% of grade')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Assignments'), {
      target: { value: '60' },
    });
    expect(screen.getAllByText('30.0% of grade')).toHaveLength(2);
  });

  it('disables expand button for tabs with no assessments', () => {
    setup();
    const expandBtns = screen.getAllByRole('button', { name: '' });
    expect(expandBtns[1]).toBeDisabled();
  });

  it('does not render an Exclude checkbox', () => {
    setup();
    expect(
      screen.queryByRole('checkbox', { name: /exclude/i }),
    ).not.toBeInTheDocument();
  });
});
