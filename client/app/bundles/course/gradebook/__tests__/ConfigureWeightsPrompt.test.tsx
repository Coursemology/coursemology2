import { fireEvent, render, screen, waitFor, within } from 'test-utils';

import ConfigureWeightsPrompt from '../components/ConfigureWeightsPrompt';
import * as operations from '../operations';

// Render synchronously without the real provider's locale-loading spinner
// (uses the manual mock at lib/components/wrappers/__mocks__/I18nProvider).
jest.mock('lib/components/wrappers/I18nProvider');

jest
  .spyOn(operations, 'updateGradebookWeights')
  .mockReturnValue(async () => {});

const A1 = 'Assignment 1';
const A2 = 'Assignment 2';
const INCLUDE_A1 = 'Include Assignment 1 in grade';

const categories = [{ id: 1, title: 'Missions' }];
const tabs = [
  { id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 50 },
  { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
];
// Differing max grades to prove equal mode is 1/n (NOT proportional to max grade).
const assessments = [
  { id: 101, title: A1, tabId: 10, maxGrade: 100 },
  { id: 102, title: A2, tabId: 10, maxGrade: 50 },
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
  screen.getByRole('radiogroup', { name: `${tabTitle} weight mode` });

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

  it('auto-rounds to 2 decimal places on blur', () => {
    setup();
    const input = screen.getByLabelText('Assignments');
    fireEvent.change(input, { target: { value: '49.555' } });
    fireEvent.blur(input);
    expect(input).toHaveValue(49.56);
    expect(screen.queryByText(/decimal places/i)).not.toBeInTheDocument();
  });

  it('defaults every tab to Equal mode', () => {
    setup();
    expect(
      within(modeGroup('Assignments')).getByRole('radio', { name: /equal/i }),
    ).toHaveAttribute('aria-checked', 'true');
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
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    expect(screen.getByLabelText('Assignments: Assignment 1')).toHaveValue(25);
    expect(screen.getByLabelText('Assignments: Assignment 2')).toHaveValue(25);
  });

  it('shows an inline error Alert and disables Save when a custom tab is unbalanced', () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
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
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(operations.updateGradebookWeights).toHaveBeenCalledWith([
        {
          tabId: 10,
          weight: 50,
          weightMode: 'custom',
          excludedAssessmentIds: [],
          assessmentWeights: [
            { assessmentId: 101, weight: 25 },
            { assessmentId: 102, weight: 25 },
          ],
        },
        {
          tabId: 11,
          weight: 50,
          weightMode: 'equal',
          excludedAssessmentIds: [],
        },
      ]);
    });
  });

  it('seeds odd splits so they still sum exactly to the tab total', () => {
    setup({
      tabs: [
        { id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 50 },
      ],
      assessments: [
        { id: 101, title: 'A1', tabId: 10, maxGrade: 100 },
        { id: 102, title: 'A2', tabId: 10, maxGrade: 100 },
        { id: 103, title: 'A3', tabId: 10, maxGrade: 100 },
      ],
    });
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    expect(screen.getByLabelText('Assignments: A1')).toHaveValue(16.67);
    expect(screen.getByLabelText('Assignments: A2')).toHaveValue(16.67);
    expect(screen.getByLabelText('Assignments: A3')).toHaveValue(16.66);
    expect(
      screen.queryByText(/must sum to its tab total/i),
    ).not.toBeInTheDocument();
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
      within(modeGroup('Optional')).getByRole('radio', { name: /custom/i }),
    ).toBeDisabled();
  });

  it('does not render an Exclude checkbox', () => {
    setup();
    expect(
      screen.queryByRole('checkbox', { name: /exclude/i }),
    ).not.toBeInTheDocument();
  });
});

describe('per-assessment exclusion', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders an include checkbox per assessment (expanded), checked by default', async () => {
    setup();
    // expand the Assignments tab to reveal its assessments
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]); // first expand caret
    const cb = await screen.findByRole('checkbox', {
      name: INCLUDE_A1,
    });
    expect(cb).toBeChecked();
  });

  it('sends excludedAssessmentIds for unchecked assessments on save', async () => {
    const onClose = jest.fn();
    setup({ onClose });
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    fireEvent.click(
      await screen.findByRole('checkbox', {
        name: INCLUDE_A1,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(operations.updateGradebookWeights).toHaveBeenCalled(),
    );
    const arg = (operations.updateGradebookWeights as jest.Mock).mock
      .calls[0][0];
    const tab10 = arg.find((e: { tabId: number }) => e.tabId === 10);
    expect(tab10.excludedAssessmentIds).toEqual([101]);
  });

  it('warns when every assessment in a tab is excluded', async () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    fireEvent.click(
      await screen.findByRole('checkbox', {
        name: INCLUDE_A1,
      }),
    );
    fireEvent.click(
      await screen.findByRole('checkbox', {
        name: 'Include Assignment 2 in grade',
      }),
    );
    expect(
      screen.getByText(/contributes nothing to the total/i),
    ).toBeInTheDocument();
  });

  it('shows excluded count on the tab header when some assessments start excluded', () => {
    setup({
      assessments: [
        {
          id: 101,
          title: A1,
          tabId: 10,
          maxGrade: 100,
          gradebookExcluded: true,
        },
        { id: 102, title: A2, tabId: 10, maxGrade: 50 },
      ],
    });
    // Badge is in the header row — no expand needed
    expect(screen.getByText('1 excluded')).toBeInTheDocument();
  });

  it('does not show excluded count when no assessments are excluded', () => {
    setup();
    expect(screen.queryByText(/excluded/i)).not.toBeInTheDocument();
  });

  it('updates the excluded count when user toggles a checkbox', async () => {
    setup();
    // Expand and exclude one assessment
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    fireEvent.click(
      await screen.findByRole('checkbox', {
        name: INCLUDE_A1,
      }),
    );
    expect(screen.getByText('1 excluded')).toBeInTheDocument();
    // Re-include it — count should disappear
    fireEvent.click(screen.getByRole('checkbox', { name: INCLUDE_A1 }));
    expect(screen.queryByText(/excluded/)).not.toBeInTheDocument();
  });

  it('labels the chip "All N excluded" when every assessment is excluded', () => {
    setup({
      assessments: [
        {
          id: 101,
          title: A1,
          tabId: 10,
          maxGrade: 100,
          gradebookExcluded: true,
        },
        {
          id: 102,
          title: A2,
          tabId: 10,
          maxGrade: 50,
          gradebookExcluded: true,
        },
      ],
    });
    expect(screen.getByText('All 2 excluded')).toBeInTheDocument();
  });

  it('shows 0 in the weight field and disables it when all assessments are excluded', () => {
    setup({
      assessments: [
        {
          id: 101,
          title: A1,
          tabId: 10,
          maxGrade: 100,
          gradebookExcluded: true,
        },
        {
          id: 102,
          title: A2,
          tabId: 10,
          maxGrade: 50,
          gradebookExcluded: true,
        },
      ],
    });
    const field = screen.getByLabelText('Assignments');
    expect(field).toHaveValue(0);
    expect(field).toBeDisabled();
  });

  it('drops an all-excluded tab from the Total and restores it on re-include', async () => {
    setup({
      assessments: [
        {
          id: 101,
          title: A1,
          tabId: 10,
          maxGrade: 100,
          gradebookExcluded: true,
        },
        {
          id: 102,
          title: A2,
          tabId: 10,
          maxGrade: 50,
          gradebookExcluded: true,
        },
        { id: 201, title: 'Optional 1', tabId: 11, maxGrade: 100 },
      ],
    });
    // Assignments (50) is all-excluded -> only Optional (50) counts toward Total.
    expect(screen.getByText(/Total:\s*50%/)).toBeInTheDocument();
    // Re-include one assessment -> Assignments contributes its 50 again.
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    fireEvent.click(
      await screen.findByRole('checkbox', {
        name: INCLUDE_A1,
      }),
    );
    expect(screen.getByText(/Total:\s*100%/)).toBeInTheDocument();
  });

  it('still persists the retained tab weight when all-excluded (display 0 only)', async () => {
    setup({
      assessments: [
        {
          id: 101,
          title: A1,
          tabId: 10,
          maxGrade: 100,
          gradebookExcluded: true,
        },
        {
          id: 102,
          title: A2,
          tabId: 10,
          maxGrade: 50,
          gradebookExcluded: true,
        },
      ],
      tabs: [
        { id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 50 },
      ],
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(operations.updateGradebookWeights).toHaveBeenCalled(),
    );
    const arg = (operations.updateGradebookWeights as jest.Mock).mock
      .calls[0][0];
    expect(arg[0]).toMatchObject({
      tabId: 10,
      weight: 50,
      excludedAssessmentIds: [101, 102],
    });
  });

  it('seeds checkboxes from gradebookExcluded and restores weight on re-include', async () => {
    setup({
      assessments: [
        {
          id: 101,
          title: A1,
          tabId: 10,
          maxGrade: 100,
          gradebookWeight: 50,
          gradebookExcluded: true,
        },
        {
          id: 102,
          title: A2,
          tabId: 10,
          maxGrade: 50,
          gradebookWeight: 0,
        },
      ],
      tabs: [
        {
          id: 10,
          title: 'Assignments',
          categoryId: 1,
          gradebookWeight: 50,
          weightMode: 'custom',
        },
      ],
    });
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    const cb = await screen.findByRole('checkbox', {
      name: INCLUDE_A1,
    });
    expect(cb).not.toBeChecked();
    // re-include -> its retained weight (50) is still in the input
    fireEvent.click(cb);
    expect(screen.getByLabelText('Assignments: Assignment 1')).toHaveValue(50);
  });

  describe('default weights when unconfigured', () => {
    const zeroTabs = [
      { id: 10, title: 'Assignments', categoryId: 1, gradebookWeight: 0 },
      { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 0 },
    ];
    const bothPopulated = [
      { id: 101, title: 'Graded item', tabId: 10, maxGrade: 100 },
      { id: 201, title: 'Bonus item', tabId: 11, maxGrade: 100 },
    ];

    it('pre-fills an equal split summing to 100 and shows the defaults hint', () => {
      setup({ tabs: zeroTabs, assessments: bothPopulated });
      expect(screen.getByText(/no weights set yet/i)).toBeInTheDocument();
      expect(screen.getByLabelText('Assignments')).toHaveValue(50);
      expect(screen.getByLabelText('Optional')).toHaveValue(50);
      expect(screen.getByText(/Total:\s*100%/)).toBeInTheDocument();
    });

    it('gives empty tabs 0% and the full default to the populated tab', () => {
      // Only tab 10 has an assessment (shared fixture), so it absorbs all 100.
      setup({ tabs: zeroTabs });
      expect(screen.getByLabelText('Assignments')).toHaveValue(100);
      expect(screen.getByLabelText('Optional')).toHaveValue(0);
    });

    it('does not show the defaults hint once a weight is configured', () => {
      setup(); // shared fixture tabs carry 50/50
      expect(screen.queryByText(/no weights set yet/i)).not.toBeInTheDocument();
    });
  });
});
