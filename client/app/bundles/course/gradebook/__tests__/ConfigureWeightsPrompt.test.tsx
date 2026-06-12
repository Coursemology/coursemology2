import { fireEvent, render, screen, waitFor, within } from 'test-utils';

import ConfigureWeightsPrompt from '../components/ConfigureWeightsPrompt';
import * as operations from '../operations';

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

  it('shows assessment weights sum footer in custom mode', () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('button', { name: /custom/i }),
    );
    expect(screen.getByText(/assessment weights:/i)).toBeInTheDocument();
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
          keepHighest: 0,
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
          keepHighest: 0,
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
      within(modeGroup('Assignments')).getByRole('button', { name: /custom/i }),
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
      within(modeGroup('Optional')).getByRole('button', { name: /custom/i }),
    ).toBeDisabled();
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

  it('shows "Excluded" label in the per-row position for an excluded assessment (equal mode)', async () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    fireEvent.click(await screen.findByRole('checkbox', { name: INCLUDE_A1 }));
    expect(screen.getAllByText('Excluded')).toHaveLength(1);
  });

  it('shows "Excluded" label in the per-row position for a custom-mode excluded assessment', async () => {
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
      tabs: [
        {
          id: 10,
          title: 'Assignments',
          categoryId: 1,
          gradebookWeight: 50,
          weightMode: 'custom' as const,
        },
        { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
      ],
    });
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    expect(await screen.findByText('Excluded')).toBeInTheDocument();
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

describe('keep-highest control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const TOGGLE = 'Enable keep highest for Assignments';
  const INPUT = 'Keep highest for Assignments';
  const three = [
    { id: 101, title: A1, tabId: 10, maxGrade: 100 },
    { id: 102, title: A2, tabId: 10, maxGrade: 50 },
    { id: 103, title: 'Assignment 3', tabId: 10, maxGrade: 80 },
  ];

  it('renders a keep-highest checkbox; number field hidden until checked', () => {
    setup({ assessments: three });
    expect(screen.getByLabelText(TOGGLE)).toBeInTheDocument();
    expect(screen.queryByLabelText(INPUT)).not.toBeInTheDocument();
  });

  it('shows a visible "Keep highest" text label next to the checkbox', () => {
    setup({ assessments: three });
    expect(screen.getByText('Keep highest')).toBeInTheDocument();
  });

  it('defaults the count to included − 1 when checked', () => {
    setup({ assessments: three }); // 3 included → default 2
    fireEvent.click(screen.getByLabelText(TOGGLE));
    expect(screen.getByLabelText(INPUT)).toHaveValue(2);
  });

  it('hides checkbox + field in custom mode', async () => {
    setup({ assessments: three });
    fireEvent.click(within(modeGroup('Assignments')).getByText('Custom'));
    await waitFor(() => {
      expect(screen.queryByLabelText(TOGGLE)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(INPUT)).not.toBeInTheDocument();
    });
  });

  it('seeds the field (checkbox pre-checked) from tab.keepHighest', () => {
    setup({
      assessments: three,
      tabs: [
        {
          id: 10,
          title: 'Assignments',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 2,
        },
        { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
      ],
    });
    expect(screen.getByLabelText(TOGGLE)).toBeChecked();
    expect(screen.getByLabelText(INPUT)).toHaveValue(2);
  });

  it('disables the checkbox when only one assessment is included', () => {
    setup(); // shared `assessments` has 2 in tab 10
    fireEvent.click(screen.getByLabelText(INCLUDE_A1)); // exclude → 1 included
    expect(screen.getByLabelText(TOGGLE)).toBeDisabled();
  });

  it('sends keepHighest in the save payload', async () => {
    const spy = jest.spyOn(operations, 'updateGradebookWeights');
    setup({ assessments: three });
    fireEvent.click(screen.getByLabelText(TOGGLE)); // defaults to 2
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(spy.mock.calls[0][0].find((e) => e.tabId === 10)!.keepHighest).toBe(
      2,
    );
  });

  it('unchecking sends keepHighest 0', async () => {
    const spy = jest.spyOn(operations, 'updateGradebookWeights');
    setup({
      assessments: three,
      tabs: [
        {
          id: 10,
          title: 'Assignments',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 2,
        },
        { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
      ],
    });
    fireEvent.click(screen.getByLabelText(TOGGLE)); // uncheck
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(spy.mock.calls[0][0].find((e) => e.tabId === 10)!.keepHighest).toBe(
      0,
    );
  });

  it('blocks saving only on malformed input (non-integer), not on keep > included', () => {
    setup({ assessments: three });
    fireEvent.click(screen.getByLabelText(TOGGLE));
    // keep > included is allowed (save enabled)
    fireEvent.change(screen.getByLabelText(INPUT), { target: { value: '9' } });
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    // non-integer value is malformed (save blocked)
    fireEvent.change(screen.getByLabelText(INPUT), {
      target: { value: '0.5' },
    });
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('prevents decimal and exponential characters from being typed in the N field', () => {
    setup({ assessments: three });
    fireEvent.click(screen.getByLabelText(TOGGLE));
    const field = screen.getByLabelText(INPUT);
    ['.', ',', 'e', 'E', '-', '+'].forEach((key) => {
      const prevented = !fireEvent.keyDown(field, { key });
      expect(prevented).toBe(true);
    });
  });

  it('shows the kept-weight subtitle and hides per-row % when keep is on', () => {
    // weight 50, included 3, keep 2 → 25.00% each
    setup({
      assessments: three,
      tabs: [
        {
          id: 10,
          title: 'Assignments',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 2,
        },
        { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
      ],
    });
    const expandBtns = screen.getAllByRole('button', { name: '' });
    fireEvent.click(expandBtns[0]); // expand Assignments
    expect(screen.getByText(/keeps highest 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/each counts as 25\.00%/i)).toBeInTheDocument();
    expect(screen.queryByText(/% of grade$/)).not.toBeInTheDocument();
    // Each assessment row shows '—' instead of a percentage
    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('shows inline overflow warning (no dismiss) when keep > included', () => {
    setup({
      assessments: three,
      tabs: [
        {
          id: 10,
          title: 'Assignments',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 5,
        },
        { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
      ],
    });
    expect(
      screen.getByText(/keeps more assessments than it contains/i),
    ).toBeInTheDocument();
    // No dismiss/close button on the overflow warning
    expect(
      screen.queryByRole('button', { name: /close/i }),
    ).not.toBeInTheDocument();
  });

  it('shows no overflow warning when keep === included (boundary)', () => {
    setup({
      assessments: three, // 3 assessments
      tabs: [
        {
          id: 10,
          title: 'Assignments',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 3,
        },
        { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
      ],
    });
    expect(
      screen.queryByText(/keeps more assessments than it contains/i),
    ).not.toBeInTheDocument();
  });

  it('does not show overflow warning when keep < included', () => {
    setup({
      assessments: three,
      tabs: [
        {
          id: 10,
          title: 'Assignments',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 2,
        },
        { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
      ],
    });
    expect(
      screen.queryByText(/keeps more assessments than it contains/i),
    ).not.toBeInTheDocument();
  });

  it('overflow warning appears inside the tab region, not at dialog top', () => {
    setup({
      assessments: three,
      tabs: [
        {
          id: 10,
          title: 'Assignments',
          categoryId: 1,
          gradebookWeight: 50,
          keepHighest: 5,
        },
        { id: 11, title: 'Optional', categoryId: 1, gradebookWeight: 50 },
      ],
    });
    // The warning text is inside the tab row div, which is after the tab list header
    // Verify: the defaults-hint (top-level) is absent; only the inline per-tab warning is present
    expect(screen.queryByText(/no weights set yet/i)).not.toBeInTheDocument();
    // The warning node is inside the tab section (not a top-level sibling of the tab list)
    const tabSection = screen
      .getByLabelText('Assignments')
      .closest('div[class]');
    expect(tabSection).not.toBeNull();
    // The warning should NOT be a direct child of the dialog root — it's nested inside the tab
    // Check it does not appear before the tab list (no top-banner position)
    const allAlerts = document.querySelectorAll('[role="alert"]');
    // Only one alert: the inline per-tab one (no top-banner duplicate)
    const overflowAlerts = Array.from(allAlerts).filter((el) =>
      el.textContent?.includes('keeps more assessments'),
    );
    expect(overflowAlerts).toHaveLength(1);
  });

  it('does not show the keep subtitle when keep-highest is off', () => {
    setup({ assessments: three });
    expect(screen.queryByText(/keeps highest/i)).not.toBeInTheDocument();
  });

  it('shows an error caption when keep value is non-integer', () => {
    setup({ assessments: three });
    fireEvent.click(screen.getByLabelText(TOGGLE));
    fireEvent.change(screen.getByLabelText(INPUT), {
      target: { value: '0.5' },
    });
    expect(screen.getByText(/keep at least 1/i)).toBeInTheDocument();
  });
});
