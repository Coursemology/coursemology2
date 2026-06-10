import { fireEvent, render, screen, waitFor, within } from 'test-utils';

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
// Differing max grades to prove equal mode is 1/n (NOT proportional to max grade).
const assessments = [
  { id: 101, title: 'Assignment 1', tabId: 10, maxGrade: 100 },
  { id: 102, title: 'Assignment 2', tabId: 10, maxGrade: 50 },
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

const modeGroup = (tabTitle: string): HTMLElement =>
  screen.getByRole('group', { name: `${tabTitle} weight mode` });

describe('<ConfigureWeightsPrompt />', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders one tab total input per tab grouped by category', () => {
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

  it('shows inline error for tab total > 100', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Assignments'), {
      target: { value: '101' },
    });
    expect(screen.getByText(/must be at most 100/i)).toBeInTheDocument();
  });

  it('shows inline error for negative tab total', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Optional'), {
      target: { value: '-1' },
    });
    expect(screen.getByText(/must be at least 0/i)).toBeInTheDocument();
  });

  it('accepts a 2dp tab total without error', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Assignments'), {
      target: { value: '49.55' },
    });
    expect(screen.queryByText(/decimal places/i)).not.toBeInTheDocument();
  });

  it('flags more than 2 decimal places', () => {
    setup();
    fireEvent.change(screen.getByLabelText('Assignments'), {
      target: { value: '49.555' },
    });
    expect(screen.getByText(/decimal places/i)).toBeInTheDocument();
  });

  it('defaults every tab to Equal mode', () => {
    setup();
    expect(
      within(modeGroup('Assignments')).getByRole('button', { name: /equal/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('equal mode preview shows tabTotal / n per assessment (ignores max grade)', () => {
    setup();
    const expandBtns = screen.getAllByRole('button', { name: '' });
    fireEvent.click(expandBtns[0]); // expand Assignments (weight 50, n=2)
    // 1/n => 25.00 each; proportional-to-maxGrade would be 33.33 / 16.67.
    expect(screen.getAllByText('25.00% of grade')).toHaveLength(2);
  });

  it('switching to Custom reveals per-assessment inputs seeded to sum the tab total', () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('button', { name: /custom/i }),
    );
    expect(screen.getByLabelText('Assignments: Assignment 1')).toHaveValue(25);
    expect(screen.getByLabelText('Assignments: Assignment 2')).toHaveValue(25);
  });

  it('shows an inline error Alert and disables Save when a custom tab is unbalanced', () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('button', { name: /custom/i }),
    );
    fireEvent.change(screen.getByLabelText('Assignments: Assignment 1'), {
      target: { value: '10' }, // 10 + 25 = 35 != 50
    });
    expect(screen.getByText(/must sum to its tab total/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('Save sends weightMode for equal tabs and assessmentWeights for custom tabs', async () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('button', { name: /custom/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(operations.updateGradebookWeights).toHaveBeenCalledWith([
        {
          tabId: 10,
          weight: 50,
          weightMode: 'custom',
          assessmentWeights: [
            { assessmentId: 101, weight: 25 },
            { assessmentId: 102, weight: 25 },
          ],
        },
        { tabId: 11, weight: 50, weightMode: 'equal' },
      ]);
    });
  });

  it('seeds odd splits so they still sum exactly to the tab total', () => {
    setup({
      tabs: [{ id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 50 }],
      assessments: [
        { id: 101, title: 'A1', tabId: 10, maxGrade: 100 },
        { id: 102, title: 'A2', tabId: 10, maxGrade: 100 },
        { id: 103, title: 'A3', tabId: 10, maxGrade: 100 },
      ],
    });
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('button', { name: /custom/i }),
    );
    expect(screen.getByLabelText('Assignments: A1')).toHaveValue(16.67);
    expect(screen.getByLabelText('Assignments: A2')).toHaveValue(16.67);
    expect(screen.getByLabelText('Assignments: A3')).toHaveValue(16.66);
    expect(screen.queryByText(/must sum to its tab total/i)).not.toBeInTheDocument();
  });

  it('Cancel does not dispatch', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(operations.updateGradebookWeights).not.toHaveBeenCalled();
  });

  it('disables the mode toggle + expand for tabs with no assessments', () => {
    setup();
    const expandBtns = screen.getAllByRole('button', { name: '' });
    expect(expandBtns[1]).toBeDisabled();
    expect(
      within(modeGroup('Optional')).getByRole('button', { name: /custom/i }),
    ).toBeDisabled();
  });

  it('does not render an Exclude checkbox', () => {
    setup();
    expect(
      screen.queryByRole('checkbox', { name: /exclude/i }),
    ).not.toBeInTheDocument();
  });
});
