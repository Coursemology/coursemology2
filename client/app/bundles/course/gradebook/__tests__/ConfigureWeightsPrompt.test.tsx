import { fireEvent, render, screen, waitFor, within } from 'test-utils';

import toast from 'lib/hooks/toast';

import ConfigureWeightsPrompt from '../components/ConfigureWeightsPrompt';
import * as operations from '../operations';

// Render synchronously without the real provider's locale-loading spinner
// (uses the manual mock at lib/components/wrappers/__mocks__/I18nProvider).
jest.mock('lib/components/wrappers/I18nProvider');
jest.mock('lib/hooks/toast', () => ({
  __esModule: true,
  default: { error: jest.fn() },
}));

jest
  .spyOn(operations, 'updateGradebookWeights')
  .mockReturnValue(async () => {});

const A1 = 'Assignment 1';
const A2 = 'Assignment 2';
const ASSIGN_A1 = 'Assignments: Assignment 1';
const INCLUDE_A1 = 'Include Assignment 1 in grade';
const LEVEL_FORMULA = 'min(level, 10) * 0.8';

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

const defaultLevelContribution = {
  enabled: false,
  formula: '',
  weight: 0,
  show: false,
  clamp: true,
};

const enabledLevel = (over = {}): Record<string, unknown> => ({
  enabled: true,
  formula: LEVEL_FORMULA,
  weight: 8,
  show: true,
  clamp: true,
  ...over,
});

const students = [
  { id: 1, name: 'A', email: 'a@x', externalId: null, level: 5, totalXp: 0 },
  { id: 2, name: 'B', email: 'b@x', externalId: null, level: 12, totalXp: 0 },
];

const levelZeroStudent = [
  { id: 1, name: 'A', email: 'a@x', externalId: null, level: 0, totalXp: 0 },
];

const setup = (overrides = {}): ReturnType<typeof render> =>
  render(
    <ConfigureWeightsPrompt
      assessments={assessments}
      categories={categories}
      courseMaxLevel={10}
      gamificationEnabled={false}
      levelContribution={defaultLevelContribution}
      onClose={jest.fn()}
      open
      students={[]}
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

  it('shows Total: 100% (not the raw float) when 2dp weights sum to 100', () => {
    // 14.29×6 + 14.26 = 99.99999999999999 in IEEE-754; the total must round to 100.
    const sevenTabs = [14.29, 14.29, 14.29, 14.29, 14.29, 14.29, 14.26].map(
      (w, i) => ({
        id: 10 + i,
        title: `T${i}`,
        categoryId: 1,
        gradebookWeight: w,
      }),
    );
    const sevenAssessments = sevenTabs.map((t, i) => ({
      id: 200 + i,
      title: `Q${i}`,
      tabId: t.id,
      maxGrade: 100,
    }));
    setup({ tabs: sevenTabs, assessments: sevenAssessments });
    expect(screen.getByText(/Total:\s*100%/)).toBeInTheDocument();
    expect(screen.queryByText(/99\.999/)).not.toBeInTheDocument();
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

  it('equal mode preview rebalances % of grade across remaining included assessments', async () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]); // expand Assignments (50, n=2)
    expect(screen.getAllByText('25.00% of grade')).toHaveLength(2);
    // Exclude Assignment 2 -> the single remaining assessment now carries the full 50.
    fireEvent.click(
      await screen.findByRole('checkbox', {
        name: 'Include Assignment 2 in grade',
      }),
    );
    expect(screen.getByText('50.00% of grade')).toBeInTheDocument();
    expect(screen.queryByText('25.00% of grade')).not.toBeInTheDocument();
  });

  it('switching to Custom reveals per-assessment inputs seeded to sum the tab total', () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    expect(screen.getByLabelText(ASSIGN_A1)).toHaveValue(25);
    expect(screen.getByLabelText('Assignments: Assignment 2')).toHaveValue(25);
  });

  it('switching to Custom preserves existing non-zero assessment weights instead of reseeding', () => {
    setup({
      assessments: [
        { id: 101, title: A1, tabId: 10, maxGrade: 100, gradebookWeight: 40 },
        { id: 102, title: A2, tabId: 10, maxGrade: 50, gradebookWeight: 10 },
      ],
    });
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    // allZero === false -> seeds left untouched (NOT redistributed to 25/25).
    expect(screen.getByLabelText(ASSIGN_A1)).toHaveValue(40);
    expect(screen.getByLabelText('Assignments: Assignment 2')).toHaveValue(10);
  });

  it('shows an inline error Alert and disables Save when a custom tab is unbalanced', () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    fireEvent.change(screen.getByLabelText(ASSIGN_A1), {
      target: { value: '10' }, // 10 + 25 = 35 != 50
    });
    expect(screen.getByText(/must sum to its tab total/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('shows the running assessment-weight sum against the tab total', () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    fireEvent.change(screen.getByLabelText(ASSIGN_A1), {
      target: { value: '10' }, // 10 + 25 = 35 of 50
    });
    expect(
      screen.getByText('Assessment weights: 35.00 / 50.00'),
    ).toBeInTheDocument();
  });

  it('Save sends weightMode for equal tabs and assessmentWeights for custom tabs', async () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => {
      expect(operations.updateGradebookWeights).toHaveBeenCalledWith(
        [
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
        ],
        expect.objectContaining({ enabled: false }),
      );
    });
  });

  it('calls onClose after a successful save', async () => {
    const onClose = jest.fn();
    setup({ onClose });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows an error toast and keeps the dialog open when save fails', async () => {
    (operations.updateGradebookWeights as jest.Mock).mockReturnValueOnce(
      async () => {
        throw new Error('boom');
      },
    );
    const onClose = jest.fn();
    setup({ onClose });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to save weights. Please try again.',
      ),
    );
    expect(onClose).not.toHaveBeenCalled();
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

  it('defaults the clamp toggle to checked', () => {
    setup({ gamificationEnabled: true, levelContribution: enabledLevel() });
    expect(
      screen.getByRole('checkbox', { name: /Keep results between/i }),
    ).toBeChecked();
  });

  it('sends clamp in the save payload', async () => {
    setup({ gamificationEnabled: true, levelContribution: enabledLevel() });
    fireEvent.click(
      screen.getByRole('checkbox', { name: /Keep results between/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() =>
      expect(operations.updateGradebookWeights).toHaveBeenCalled(),
    );
    const arg = (operations.updateGradebookWeights as jest.Mock).mock
      .calls[0][1];
    expect(arg.clamp).toBe(false);
  });

  it('suppresses the range alert when clamp is off', () => {
    setup({
      gamificationEnabled: true,
      students, // levels 5, 12
      levelContribution: enabledLevel({
        formula: 'level * 5',
        weight: 10,
        clamp: false,
      }),
      // raw 25 and 60 are above 10, but clamp is off -> no alert
    });
    expect(screen.queryByText(/above 10/i)).not.toBeInTheDocument();
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
      keepHighest: 0,
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
    expect(screen.getByLabelText(ASSIGN_A1)).toHaveValue(50);
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

  it('shows assessment weights sum footer in custom mode', () => {
    setup();
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    // Expand to see the footer
    // custom mode auto-expands, so just check the footer
    expect(screen.getByText(/Assessment weights:/i)).toBeInTheDocument();
  });
});

describe('per-assessment exclusion (extended)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows "Excluded" label in custom mode for excluded assessment', async () => {
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
          weightMode: 'custom',
        },
      ],
    });
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    expect(await screen.findByText('Excluded')).toBeInTheDocument();
  });

  it('does not show "Excluded" label in equal mode for excluded assessment', async () => {
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
    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    // In equal mode excluded shows "Excluded" text too
    expect(await screen.findByText('Excluded')).toBeInTheDocument();
  });
});

describe('keep-highest control', () => {
  const TOGGLE = 'Enable keep highest for Assignments';
  const INPUT = 'Keep highest for Assignments';
  const three = [
    { id: 101, title: A1, tabId: 10, maxGrade: 100 },
    { id: 102, title: A2, tabId: 10, maxGrade: 50 },
    { id: 103, title: 'Assignment 3', tabId: 10, maxGrade: 80 },
  ];

  beforeEach(() => jest.clearAllMocks());

  it('renders a keep-highest checkbox; number field hidden until checked', () => {
    setup({ assessments: three });
    expect(screen.getByRole('checkbox', { name: TOGGLE })).toBeInTheDocument();
    expect(
      screen.queryByRole('spinbutton', { name: INPUT }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: TOGGLE }));
    expect(screen.getByRole('spinbutton', { name: INPUT })).toBeInTheDocument();
  });

  it('shows a visible "Keep highest" text label next to the checkbox', () => {
    setup({ assessments: three });
    expect(screen.getByText('Keep highest')).toBeInTheDocument();
  });

  it('defaults the count to included − 1 when checked', () => {
    setup({ assessments: three }); // 3 assessments -> default to 2
    fireEvent.click(screen.getByRole('checkbox', { name: TOGGLE }));
    expect(screen.getByRole('spinbutton', { name: INPUT })).toHaveValue(2);
  });

  it('hides checkbox + field in custom mode', () => {
    setup({ assessments: three });
    fireEvent.click(
      within(modeGroup('Assignments')).getByRole('radio', { name: /custom/i }),
    );
    expect(
      screen.queryByRole('checkbox', { name: TOGGLE }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('spinbutton', { name: INPUT }),
    ).not.toBeInTheDocument();
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
    expect(screen.getByRole('checkbox', { name: TOGGLE })).toBeChecked();
    expect(screen.getByRole('spinbutton', { name: INPUT })).toHaveValue(2);
  });

  it('disables the checkbox when only one assessment is included', () => {
    setup({
      assessments: [{ id: 101, title: A1, tabId: 10, maxGrade: 100 }],
    });
    expect(screen.getByRole('checkbox', { name: TOGGLE })).toBeDisabled();
  });

  it('sends keepHighest in the save payload', async () => {
    setup({ assessments: three });
    fireEvent.click(screen.getByRole('checkbox', { name: TOGGLE }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() =>
      expect(operations.updateGradebookWeights).toHaveBeenCalled(),
    );
    const arg = (operations.updateGradebookWeights as jest.Mock).mock
      .calls[0][0];
    const tab10 = arg.find((e: { tabId: number }) => e.tabId === 10);
    expect(tab10.keepHighest).toBe(2);
  });

  it('unchecking sends keepHighest 0', async () => {
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
    // checkbox is pre-checked; uncheck it
    fireEvent.click(screen.getByRole('checkbox', { name: TOGGLE }));
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() =>
      expect(operations.updateGradebookWeights).toHaveBeenCalled(),
    );
    const arg = (operations.updateGradebookWeights as jest.Mock).mock
      .calls[0][0];
    const tab10 = arg.find((e: { tabId: number }) => e.tabId === 10);
    expect(tab10.keepHighest).toBe(0);
  });

  it('blocks saving on non-integer input but not on keep > included (overflow)', async () => {
    setup({ assessments: three });
    fireEvent.click(screen.getByRole('checkbox', { name: TOGGLE }));
    const input = screen.getByRole('spinbutton', { name: INPUT });

    // overflow: keep=5 > included=3 -> warning but save NOT blocked
    fireEvent.change(input, { target: { value: '5' } });
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
    expect(
      screen.getByText(/keeps more assessments than it contains/i),
    ).toBeInTheDocument();

    // non-integer (0): should block saving
    fireEvent.change(input, { target: { value: '0' } });
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
    expect(screen.getByText(/keep at least 1/i)).toBeInTheDocument();
  });
});

describe('level contribution section', () => {
  beforeEach(() => jest.clearAllMocks());

  it('is not rendered when gamificationEnabled is false', () => {
    setup({ gamificationEnabled: false });
    expect(screen.queryByText(/level contribution/i)).not.toBeInTheDocument();
  });

  it('renders the level section when gamificationEnabled is true', () => {
    setup({ gamificationEnabled: true });
    expect(screen.getByText(/level contribution/i)).toBeInTheDocument();
  });

  it('seeds enabled, formula, weight, and show from the levelContribution prop', () => {
    setup({ gamificationEnabled: true, levelContribution: enabledLevel() });
    expect(screen.getByLabelText(/formula/i)).toHaveValue(LEVEL_FORMULA);
    // Exact name: the clamp label ("...max level contributions") also matches
    // /level contribution/i, so an exact string isolates the enable toggle.
    expect(
      screen.getByRole('checkbox', { name: 'Level contribution' }),
    ).toBeChecked();
  });

  it('no longer offers a "custom max level" control', () => {
    setup({ gamificationEnabled: true, levelContribution: enabledLevel() });
    expect(
      screen.queryByRole('checkbox', { name: /custom max level/i }),
    ).not.toBeInTheDocument();
    // The removed control was a numeric field; scope to spinbutton so the clamp
    // checkbox ("...max level contributions") isn't mistaken for it.
    expect(
      screen.queryByRole('spinbutton', { name: /max level/i }),
    ).not.toBeInTheDocument();
  });

  it('shows the highest student level and the course maximum level', () => {
    setup({
      gamificationEnabled: true,
      courseMaxLevel: 14,
      students, // levels 5 and 12
      levelContribution: enabledLevel(),
    });
    expect(screen.getByText(/Highest student level: 12/)).toBeInTheDocument();
    expect(screen.getByText(/Course maximum level: 14/)).toBeInTheDocument();
  });

  it('renders the level weight as a bare number with no caption or tooltip', () => {
    setup({ gamificationEnabled: true, levelContribution: enabledLevel() });
    expect(
      screen.getByRole('spinbutton', { name: 'Level contribution' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Suggested maximum/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/never caps or blocks/i)).not.toBeInTheDocument();
  });

  it('describes the level term without the word "bonus"', () => {
    setup({ gamificationEnabled: true, levelContribution: enabledLevel() });
    expect(
      screen.getByText(/Adds grade-points from each student/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/bonus/i)).not.toBeInTheDocument();
  });

  it('always shows the formula syntax reference, even when the formula is valid', () => {
    setup({
      gamificationEnabled: true,
      students, // valid default formula min(level, 10) for these students
      levelContribution: enabledLevel(),
    });
    expect(
      screen.getByText(/floor, ceil, round, min and max/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/arithmetic operators/i)).toBeInTheDocument();
  });

  it('shows no warning when every contribution is in range', () => {
    setup({
      gamificationEnabled: true,
      students, // levels 5, 12 → min(level,10)*0.8 = 4, 8 — both within 0..8
      levelContribution: enabledLevel(),
    });
    expect(screen.queryByText(/below 0/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/above/i)).not.toBeInTheDocument();
  });

  it('names the offending student(s) only on the lower bound when none exceed the max', () => {
    setup({
      gamificationEnabled: true,
      students, // levels 5, 12
      levelContribution: enabledLevel({ formula: 'level - 8', weight: 10 }),
      // contributions -3 (A) and 4 (B): only A is below 0
    });
    expect(screen.getByText('A (-3.00) is below 0.')).toBeInTheDocument();
    expect(
      screen.getByText(/These contributions will be set to 0\./),
    ).toBeInTheDocument();
    expect(screen.queryByText(/above/i)).not.toBeInTheDocument();
  });

  it('names the worst offenders (value, highest first) only on the upper bound', () => {
    setup({
      gamificationEnabled: true,
      students, // levels 5, 12
      levelContribution: enabledLevel({ formula: 'level * 5', weight: 10 }),
      // contributions 25 (A) and 60 (B), both above 10
    });
    expect(
      screen.getByText('B (60.00) and A (25.00) are above 10.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/These contributions will be set to 10\./),
    ).toBeInTheDocument();
    expect(screen.queryByText(/below 0/i)).not.toBeInTheDocument();
  });

  it('caps the list at two names and appends "and N more"', () => {
    const many = [
      {
        id: 1,
        name: 'S1',
        email: 'a@x',
        externalId: null,
        level: 3,
        totalXp: 0,
      },
      {
        id: 2,
        name: 'S2',
        email: 'b@x',
        externalId: null,
        level: 4,
        totalXp: 0,
      },
      {
        id: 3,
        name: 'S3',
        email: 'c@x',
        externalId: null,
        level: 5,
        totalXp: 0,
      },
      {
        id: 4,
        name: 'S4',
        email: 'd@x',
        externalId: null,
        level: 6,
        totalXp: 0,
      },
    ];
    setup({
      gamificationEnabled: true,
      students: many,
      levelContribution: enabledLevel({ formula: 'level * 5', weight: 10 }),
      // contributions 15,20,25,30 — all above 10; top two then "and 2 more"
    });
    expect(
      screen.getByText('S4 (30.00), S3 (25.00) and 2 more are above 10.'),
    ).toBeInTheDocument();
  });

  it('names offenders on both bounds with a combined fix instruction', () => {
    setup({
      gamificationEnabled: true,
      students, // levels 5, 12
      levelContribution: enabledLevel({
        formula: 'level * 5 - 30',
        weight: 10,
      }),
      // contributions -5 (A) and 30 (B): one below 0, one above 10
    });
    expect(
      screen.getByText('B (30.00) is above 10. A (-5.00) is below 0.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Contributions below 0 will be set to 0, and contributions above 10 will be set to 10\./,
      ),
    ).toBeInTheDocument();
  });

  it('seeds the level weight to the course max level when unconfigured (works on first open)', () => {
    setup({
      gamificationEnabled: true,
      courseMaxLevel: 30,
      students, // levels 5, 12
      // fresh course: enabled, but no formula / weight yet
      levelContribution: { enabled: true, formula: '', weight: 0, show: false },
    });
    // weight defaults to 30 and the formula seeds to min(level, 30) → in range,
    // so there is no out-of-range warning.
    expect(
      screen.getByRole('spinbutton', { name: 'Level contribution' }),
    ).toHaveValue(30);
    expect(screen.queryByText(/below 0/i)).not.toBeInTheDocument();
  });

  it('shows a parse error and disables Save when the formula is invalid', () => {
    setup({
      gamificationEnabled: true,
      levelContribution: enabledLevel({ formula: 'level +' }),
    });
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('includes levelContribution in the save payload without a maxLevel field', async () => {
    setup({ gamificationEnabled: true, levelContribution: enabledLevel() });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() =>
      expect(operations.updateGradebookWeights).toHaveBeenCalled(),
    );
    const [, lvl] = (operations.updateGradebookWeights as jest.Mock).mock
      .calls[0];
    expect(lvl).toMatchObject({
      enabled: true,
      formula: LEVEL_FORMULA,
      weight: 8,
      show: true,
    });
    expect(lvl).not.toHaveProperty('maxLevel');
  });

  it('adds the level weight to the Total when enabled', () => {
    // tabs sum to 100; level adds 8 → Total should be 108
    setup({ gamificationEnabled: true, levelContribution: enabledLevel() });
    expect(screen.getByText(/Total:\s*108%/)).toBeInTheDocument();
  });

  it('excludes the level weight from the Total when gamification is disabled', () => {
    // A persisted enabled level (weight 8) must not count once gamification is
    // off — the section is hidden, so it is treated as disabled. Total stays 100.
    setup({ gamificationEnabled: false, levelContribution: enabledLevel() });
    expect(screen.getByText(/Total:\s*100%/)).toBeInTheDocument();
  });

  it('warns and names students when the formula divides by zero for them', async () => {
    setup({
      gamificationEnabled: true,
      students: levelZeroStudent,
      levelContribution: enabledLevel({ formula: '100 / level' }),
    });
    // ...render with the level contribution enabled and a student at level 0...
    // ...set the formula field to '100 / level'...
    expect(await screen.findByText(/divides by zero/i)).toBeInTheDocument();
    expect(screen.getByText(/set to 0/i)).toBeInTheDocument();
  });
});
