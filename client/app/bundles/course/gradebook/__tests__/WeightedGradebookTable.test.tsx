import userEvent from '@testing-library/user-event';
import { store as appStore } from 'store';
import { render, screen, waitFor, within } from 'test-utils';
import TestApp from 'utilities/TestApp';

import WeightedGradebookTable from '../components/WeightedGradebookTable';
import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from '../types';

// Render synchronously without the real provider's locale-loading spinner
// (uses the manual mock at lib/components/wrappers/__mocks__/I18nProvider).
jest.mock('lib/components/wrappers/I18nProvider');

const USER_ID = 42;
const WEIGHTED_STORAGE_KEY = `${USER_ID}:gradebook_weighted_columns_1`;
const EXTERNAL_ID = 'External ID';
const LEVEL_CONTRIBUTION = 'Level Contribution';
const ALICE_EMAIL = 'alice@example.com';

// Mirrors the component's data-testid for a breakdown row:
// `breakdown-row-${studentId}-${tabId}-${assessmentId}`.
const breakdownRowId = (
  studentId: number,
  tabId: number,
  assessmentId: number,
): string => `breakdown-row-${studentId}-${tabId}-${assessmentId}`;
const userState = {
  global: {
    ...appStore.getState().global,
    user: {
      ...appStore.getState().global.user,
      user: { id: USER_ID, name: '', imageUrl: '' },
    },
  },
};

// ---------------------------------------------------------------------------
// Minimal shared fixtures
// ---------------------------------------------------------------------------
const makeCategory = (id: number, title: string): CategoryData => ({
  id,
  title,
});

const makeTab = (
  id: number,
  title: string,
  categoryId: number,
  gradebookWeight = 50,
): TabData => ({ id, title, categoryId, gradebookWeight });

const makeAssessment = (
  id: number,
  title: string,
  tabId: number,
  maxGrade: number,
): AssessmentData => ({ id, title, tabId, maxGrade });

const makeStudent = (id: number, name: string): StudentData => ({
  id,
  name,
  email: `${name.toLowerCase()}@example.com`,
  externalId: null,
  level: 1,
  totalXp: 0,
  levelContribution: null,
});

const makeSub = (
  studentId: number,
  assessmentId: number,
  grade: number | null,
): SubmissionData => ({ submissionId: 0, studentId, assessmentId, grade });

const defaultLevelContribution = {
  enabled: false,
  formula: '',
  weight: 0,
  show: false,
  clamp: true,
};

interface RenderWeightedOptions {
  categories?: CategoryData[];
  tabs?: TabData[];
  assessments?: AssessmentData[];
  students?: StudentData[];
  submissions?: SubmissionData[];
  canManageWeights?: boolean;
  courseTitle?: string;
  courseId?: number;
  gamificationEnabled?: boolean;
  courseMaxLevel?: number;
  levelContribution?: typeof defaultLevelContribution;
}

const renderWeighted = (
  opts: RenderWeightedOptions = {},
): ReturnType<typeof render> => {
  const cats = opts.categories ?? [makeCategory(1, 'Cat A')];
  const tabs = opts.tabs ?? [makeTab(10, 'Tab 1', 1, 100)];
  const assessments = opts.assessments ?? [
    makeAssessment(100, 'Quiz 1', 10, 150),
  ];
  const students = opts.students ?? [makeStudent(1, 'Alice')];
  const submissions = opts.submissions ?? [];
  return render(
    <WeightedGradebookTable
      assessments={assessments}
      canManageWeights={opts.canManageWeights ?? true}
      categories={cats}
      courseId={opts.courseId ?? 1}
      courseMaxLevel={opts.courseMaxLevel ?? 0}
      courseTitle={opts.courseTitle ?? 'Test Course'}
      gamificationEnabled={opts.gamificationEnabled ?? false}
      levelContribution={opts.levelContribution ?? defaultLevelContribution}
      students={students}
      submissions={submissions}
      tabs={tabs}
    />,
    { state: userState },
  );
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('WeightedGradebookTable', () => {
  beforeEach(() => localStorage.clear());

  // 1. Row 1: category cells with colSpan
  it('renders category cells in row 1 with colSpan equal to number of tabs in that category', () => {
    const cats = [makeCategory(1, 'Cat A'), makeCategory(2, 'Cat B')];
    const tabs = [
      makeTab(10, 'Tab 1', 1, 50),
      makeTab(11, 'Tab 2', 1, 50),
      makeTab(20, 'Tab 3', 2, 0),
    ];
    const assessments = [
      makeAssessment(100, 'Q1', 10, 10),
      makeAssessment(101, 'Q2', 11, 10),
      makeAssessment(102, 'Q3', 20, 10),
    ];
    renderWeighted({ categories: cats, tabs, assessments });
    const thead = document.querySelector('thead')!;
    const rows = thead.querySelectorAll('tr');
    const row1Cells = rows[0].querySelectorAll('th');
    const catACell = Array.from(row1Cells).find(
      (c) => c.textContent === 'Cat A',
    );
    const catBCell = Array.from(row1Cells).find(
      (c) => c.textContent === 'Cat B',
    );
    expect(catACell).toBeTruthy();
    expect(catBCell).toBeTruthy();
    expect(
      catACell!.getAttribute('colspan') ?? catACell!.colSpan.toString(),
    ).toBe('2');
    expect(
      catBCell!.getAttribute('colspan') ?? catBCell!.colSpan.toString(),
    ).toBe('1');
  });

  // 1b. Category not in tabs → header absent
  it('does not render a category header for categories with no tabs', () => {
    renderWeighted({
      categories: [makeCategory(1, 'Active'), makeCategory(2, 'Ghost')],
      tabs: [makeTab(10, 'Tab 1', 1, 100)], // only category 1 has a tab
    });
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.queryByText('Ghost')).not.toBeInTheDocument();
  });

  // 2. Row 2: tab title cells
  it('renders tab title cells in row 2', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Homework', 1, 60), makeTab(11, 'Exams', 1, 40)],
    });
    const thead = document.querySelector('thead')!;
    const row2 = thead.querySelectorAll('tr')[1];
    expect(
      within(row2 as HTMLElement).getByText('Homework'),
    ).toBeInTheDocument();
    expect(within(row2 as HTMLElement).getByText('Exams')).toBeInTheDocument();
  });

  // 3. Weight subheader shows "/N" (points-out-of) per tab by default
  it('shows "/N" points subheader for each tab in row 3 by default', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 30), makeTab(11, 'Tab 2', 1, 70)],
    });
    expect(screen.getByText('/30')).toBeInTheDocument();
    expect(screen.getByText('/70')).toBeInTheDocument();
  });

  // 4a. Total column shows "/100" when sum = 100 (points default)
  it('shows "/100" in total column header when weights sum to 100', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 60), makeTab(11, 'Tab 2', 1, 40)],
    });
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  // 4a-bis. Regression: 2dp weights that sum to exactly 100 must not trip the
  // IEEE-754 float sum (14.29×6 + 14.26 = 99.99999999999999). Header shows /100,
  // never the raw float.
  it('shows "/100" (not the raw float) when 2dp weights sum to 100', () => {
    renderWeighted({
      tabs: [
        makeTab(10, 'T0', 1, 14.29),
        makeTab(11, 'T1', 1, 14.29),
        makeTab(12, 'T2', 1, 14.29),
        makeTab(13, 'T3', 1, 14.29),
        makeTab(14, 'T4', 1, 14.29),
        makeTab(15, 'T5', 1, 14.29),
        makeTab(16, 'T6', 1, 14.26),
      ],
    });
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.queryByText(/99\.999/)).not.toBeInTheDocument();
  });

  // 4b. Total column shows just "/N" on one line when sum ≠ 100
  it('shows "/N" when weight sum ≠ 100 in total header', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 30), makeTab(11, 'Tab 2', 1, 30)],
    });
    expect(screen.getByText('/60')).toBeInTheDocument();
  });

  // 4c. Hovering the warning-coloured total reveals the full message via tooltip
  it('total tooltip explains the unbalanced sum on hover', async () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 60), makeTab(11, 'Tab 2', 1, 20)],
    });
    await userEvent.hover(screen.getByText('/80'));
    await waitFor(() =>
      expect(
        screen.getByText('Weights do not sum to 100. Total may be inaccurate.'),
      ).toBeInTheDocument(),
    );
  });

  // 4b. Total column shows just "/N" on one line when sum ≠ 100
  it('shows "N% total" when sum ≠ 100 in total header', async () => {
    const user = userEvent.setup();
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 30), makeTab(11, 'Tab 2', 1, 30)],
    });
    await user.click(screen.getByRole('radio', { name: /percentage/i }));
    const thead = document.querySelector('thead')!;
    const row3 = thead.querySelectorAll('tr')[2] as HTMLElement;
    expect(within(row3).getByText('60% total')).toBeInTheDocument();
  });

  // 4d. Percent mode, weights = 100 → total header shows exact "100% total"
  it('total column header shows "100% total" in percent mode when sum = 100', async () => {
    const user = userEvent.setup();
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 60), makeTab(11, 'Tab 2', 1, 40)],
    });
    await user.click(screen.getByRole('radio', { name: /percentage/i }));
    const thead = document.querySelector('thead')!;
    const row3 = thead.querySelectorAll('tr')[2] as HTMLElement;
    expect(within(row3).getByText('100% total')).toBeInTheDocument();
  });

  // 5. Cell renders subtotal × weight as points (not percentage); non-integer → 2dp
  it('renders cell as subtotal × weight in points (not a percentage); 2dp when non-integer', () => {
    // grade=130, maxGrade=150 → subtotal=130/150≈0.8667; weight=100
    // points = 0.8667 × 100 = 86.67 (non-integer → 2dp)
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Q1', 10, 150)],
      students: [makeStudent(1, 'Alice')],
      submissions: [makeSub(1, 100, 130)],
    });
    expect(screen.getAllByText('86.67').length).toBeGreaterThanOrEqual(1);
  });

  // 5b. Column precision: 1dp — all values shown at 1dp when any value needs 1dp
  it('shows 1dp for all values in a column when any value needs 1dp but none needs 2dp', () => {
    // grade=15, maxGrade=40, weight=100 → 37.5 (needs 1dp)
    // grade=20, maxGrade=40, weight=100 → 50.0 (integer alone, but column needs 1dp)
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Q1', 10, 40)],
      students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
      submissions: [makeSub(1, 100, 15), makeSub(2, 100, 20)],
    });
    // Tab cell + total cell both show the same value for single-tab setup
    expect(screen.getAllByText('37.5').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('50.0').length).toBeGreaterThanOrEqual(1);
    // Confirm the old 2dp format is NOT shown
    expect(screen.queryByText('37.50')).not.toBeInTheDocument();
    expect(screen.queryByText('50.00')).not.toBeInTheDocument();
  });

  // 5c. Column precision: 2dp forces all values to 2dp, even whole numbers
  it('shows 2dp for ALL values in a column when any value needs 2dp', () => {
    // Alice: grade=130, maxGrade=150, weight=100 → 86.67 (needs 2dp)
    // Bob: grade=150, maxGrade=150, weight=100 → 100 (integer, but column needs 2dp)
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Q1', 10, 150)],
      students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
      submissions: [makeSub(1, 100, 130), makeSub(2, 100, 150)],
    });
    expect(screen.getAllByText('86.67').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('100.00').length).toBeGreaterThanOrEqual(1);
    // Confirm the integer format is NOT shown in any table cell
    expect(
      screen.queryAllByRole('cell').some((c) => c.textContent === '100'),
    ).toBe(false);
  });

  // 5d. Different columns can have independent precision
  it('applies column precision independently per tab column', () => {
    // Tab 1 weight=100: Alice → 86.67 (2dp); Tab 2 weight=40: Alice → 36 (integer)
    renderWeighted({
      categories: [makeCategory(1, 'Cat A')],
      tabs: [makeTab(10, 'Tab 1', 1, 100), makeTab(20, 'Tab 2', 1, 40)],
      assessments: [
        makeAssessment(100, 'Q1', 10, 150),
        makeAssessment(200, 'Q2', 20, 100),
      ],
      students: [makeStudent(1, 'Alice')],
      submissions: [makeSub(1, 100, 130), makeSub(1, 200, 90)],
    });
    // Tab 1: 86.67 (2dp); Tab 2: 36 (integer)
    expect(screen.getByText('86.67')).toBeInTheDocument();
    expect(screen.getByText('36')).toBeInTheDocument();
  });

  // 5e. Total column precision is independent of tab column precision
  it('total column uses its own column precision', () => {
    // Tab 1 weight=100: Alice=86.67, Bob=100.00; total=86.67 and 100.00
    // Both totals have same precision as tab (2dp), but they're independently computed
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Q1', 10, 150)],
      students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
      submissions: [makeSub(1, 100, 130), makeSub(2, 100, 150)],
    });
    // Total for Alice = 86.67 (needs 2dp), so all totals show 2dp
    expect(screen.getAllByText('86.67').length).toBeGreaterThanOrEqual(2); // tab cell + total cell
    expect(screen.getAllByText('100.00').length).toBeGreaterThanOrEqual(2);
  });

  // 6a. Tab with no assessments → cell shows "—"
  it('shows "—" for a tab with no assessments', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Empty Tab', 1, 100)],
      assessments: [],
      students: [makeStudent(1, 'Alice')],
      submissions: [],
    });
    const aliceRow = screen.getByText('Alice').closest('tr')!;
    const cells = within(aliceRow).getAllByRole('cell');
    // The tab cell (between Name and Total) renders "—" for an empty tab.
    expect(cells[cells.length - 2]).toHaveTextContent('—');
  });

  // 6b. Total cell shows "—" when every tab subtotal is null (no assessments at all)
  it('shows "—" in the total cell when the row has no contributing tabs', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Empty Tab', 1, 100)],
      assessments: [],
      students: [makeStudent(1, 'Alice')],
      submissions: [],
    });
    const aliceRow = screen.getByText('Alice').closest('tr')!;
    const cells = within(aliceRow).getAllByRole('cell');
    expect(cells[cells.length - 1]).toHaveTextContent('—');
  });

  // 7. Student with no graded submissions → cell shows 0 (ungraded count as 0)
  it('shows 0 when student has no graded submissions in a tab', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Q1', 10, 10)],
      students: [makeStudent(1, 'Alice')],
      submissions: [],
    });
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  // 7b. Total cell shows 0 when all assessments are ungraded
  it('shows 0 in both the tab cell and the total cell when all assessments are ungraded', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Q1', 10, 10)],
      students: [makeStudent(1, 'Alice')],
      submissions: [],
    });
    // tab cell = 0, total cell = 0 → at least 2 zeros
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(2);
  });

  // 8. Total equals the sum of the row's cells
  it('total cell equals the sum of per-tab point cells', () => {
    // tab10 equal-weight: (80/100 + 50/50) / 2 = 0.9 → points = 60*0.9 = 54
    // tab20 equal-weight: 90/100 = 0.9 → points = 40*0.9 = 36
    // total = 54 + 36 = 90
    renderWeighted({
      categories: [makeCategory(1, 'Cat A')],
      tabs: [makeTab(10, 'Tab 1', 1, 60), makeTab(20, 'Tab 2', 1, 40)],
      assessments: [
        makeAssessment(1, 'A1', 10, 100),
        makeAssessment(2, 'A2', 10, 50),
        makeAssessment(3, 'A3', 20, 100),
      ],
      students: [makeStudent(1, 'Alice')],
      submissions: [makeSub(1, 1, 80), makeSub(1, 2, 50), makeSub(1, 3, 90)],
    });
    expect(screen.getByText('54')).toBeInTheDocument();
    expect(screen.getByText('36')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  // 9. Ungraded assessments always count as 0
  it('counts ungraded assessments as 0 in the subtotal', () => {
    // Q1 graded (40/50), Q2 ungraded → (40/50 + 0) / 2 = 0.4; weight=100 → 40 pts
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [
        makeAssessment(100, 'Q1', 10, 50),
        makeAssessment(101, 'Q2', 10, 50),
      ],
      students: [makeStudent(1, 'Alice')],
      submissions: [makeSub(1, 100, 40)],
    });
    expect(screen.getAllByText('40').length).toBeGreaterThanOrEqual(1);
  });

  // 10. No weights configured but tabs have assessments → equal-split default
  // banner (with Configure CTA for managers), not the bare empty state.
  it('shows the default-weights banner when no weights are configured', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 0), makeTab(11, 'Tab 2', 1, 0)],
      assessments: [
        makeAssessment(100, 'Quiz 1', 10, 150),
        makeAssessment(101, 'Quiz 2', 11, 100),
      ],
    });
    expect(screen.getByText(/showing default weights/i)).toBeInTheDocument();
    expect(screen.getByText(/set your own/i)).toBeInTheDocument();
  });

  // 10a. Default split feeds the totals: two tabs → 50/100 each, summing to 100.
  it('applies an equal split (sums to 100) when no weights are configured', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 0), makeTab(11, 'Tab 2', 1, 0)],
      assessments: [
        makeAssessment(100, 'Quiz 1', 10, 100),
        makeAssessment(101, 'Quiz 2', 11, 100),
      ],
    });
    // Total subheader reads "/100" (points), with no "does not sum" warning.
    expect(screen.getByText('/100')).toBeInTheDocument();
    expect(screen.queryByText(/does not sum to 100/i)).not.toBeInTheDocument();
  });

  // 10b. No weights configured + canManageWeights=false → no-access default copy
  it('shows the no-access default-weights banner when canManageWeights is false', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 0)],
      canManageWeights: false,
    });
    expect(
      screen.getByText(/until weights are configured/i),
    ).toBeInTheDocument();
  });

  // 10d. Degenerate case: weights 0 AND no assessments to default → bare empty state
  it('shows the bare empty-state banner when no tab has any assessment', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 0)],
      assessments: [],
    });
    expect(screen.getByText(/no weights configured/i)).toBeInTheDocument();
  });

  // 10c. At least one non-zero weight → banner absent
  it('does not show empty-state banner when at least one tab has a non-zero weight', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 50)],
    });
    expect(
      screen.queryByText(/no weights configured/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/no tab weights have been configured yet/i),
    ).not.toBeInTheDocument();
  });

  // 11. canManageWeights === false → no "Configure Weights" button
  it('does not show Configure Weights button when canManageWeights is false', () => {
    renderWeighted({ canManageWeights: false });
    expect(
      screen.queryByRole('button', { name: /configure weights/i }),
    ).not.toBeInTheDocument();
  });

  // 12. canManageWeights === true → "Configure Weights" button present
  it('shows Configure Weights button when canManageWeights is true', () => {
    renderWeighted({ canManageWeights: true });
    expect(
      screen.getByRole('button', { name: /configure weights/i }),
    ).toBeInTheDocument();
  });

  // 13. Search bar is rendered
  it('renders a search bar', () => {
    renderWeighted();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  // 14. Typing in the search bar filters student rows
  it('filters student rows when typing a name in the search bar', async () => {
    const user = userEvent.setup();
    renderWeighted({
      students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
    });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox'), 'Alice');

    await waitFor(() =>
      expect(screen.queryByText('Bob')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  // 14b. Typing an external ID filters student rows (externalId column is searchable)
  it('filters student rows when typing an external ID in the search bar', async () => {
    const user = userEvent.setup();
    renderWeighted({
      students: [
        { ...makeStudent(1, 'Alice'), externalId: 'EXT-001' },
        { ...makeStudent(2, 'Bob'), externalId: 'EXT-002' },
      ],
    });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox'), 'EXT-001');

    await waitFor(() =>
      expect(screen.queryByText('Bob')).not.toBeInTheDocument(),
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  // 14c. Typing an email filters student rows when Email column is visible
  it('filters student rows when typing an email in the search bar', async () => {
    const user = userEvent.setup();

    localStorage.setItem(WEIGHTED_STORAGE_KEY, JSON.stringify({ email: true }));

    renderWeighted({
      students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
    });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(ALICE_EMAIL)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox'), ALICE_EMAIL);

    await waitFor(() =>
      expect(screen.queryByText('Bob')).not.toBeInTheDocument(),
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  // 15. Pagination controls appear when there are more students than the page size
  it('shows pagination controls when students exceed the default page size', () => {
    const manyStudents = Array.from({ length: 101 }, (_, i) =>
      makeStudent(i + 1, `Student ${i + 1}`),
    );
    renderWeighted({ students: manyStudents });
    expect(screen.getByText('1-100 / 101')).toBeInTheDocument();
  });

  // 16. Row selection checkboxes are rendered for each student
  it('renders checkboxes for row selection', () => {
    renderWeighted({
      students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
    });
    // One "select all" header checkbox + one per student row
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(3);
  });

  describe('column picker', () => {
    it('shows Select Columns and Export buttons', () => {
      renderWeighted();
      expect(
        screen.getByRole('button', { name: /select columns/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /export/i }),
      ).toBeInTheDocument();
    });

    it('shows "Export all rows" when no rows are selected', () => {
      renderWeighted();
      expect(
        screen.getByRole('button', { name: /export all rows/i }),
      ).toBeInTheDocument();
    });

    it('shows "Export 1 row" when one row is selected', async () => {
      const user = userEvent.setup();
      renderWeighted({
        students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
      });
      const checkboxes = screen.getAllByRole('checkbox');
      // checkboxes[0] is header "select all"; [1] is the first row
      await user.click(checkboxes[1]);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /export 1 row/i }),
        ).toBeInTheDocument(),
      );
    });

    it('shows "Export all rows" when all rows are selected', async () => {
      const user = userEvent.setup();
      renderWeighted({
        students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
      });
      const checkboxes = screen.getAllByRole('checkbox');
      // checkboxes[0] is the header "select all" checkbox
      await user.click(checkboxes[0]);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /export all rows/i }),
        ).toBeInTheDocument(),
      );
      expect(
        screen.queryByRole('button', { name: /export 2 rows/i }),
      ).not.toBeInTheDocument();
    });

    it('shows export tooltip when no rows are selected', async () => {
      renderWeighted();
      await userEvent.hover(
        screen.getByRole('button', { name: /export all rows/i }),
      );
      await waitFor(() =>
        expect(
          screen.getByText('No rows selected - all rows will be exported.'),
        ).toBeInTheDocument(),
      );
    });

    it('hides the export tooltip when at least one row is selected', async () => {
      const user = userEvent.setup();
      renderWeighted({
        students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
      });
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]);
      const exportBtn = await screen.findByRole('button', {
        name: /export 1 row/i,
      });
      await userEvent.hover(exportBtn);
      await waitFor(() =>
        expect(
          screen.queryByText('No rows selected - all rows will be exported.'),
        ).not.toBeInTheDocument(),
      );
    });

    it('lists Email in the picker dialog (no gamification columns)', async () => {
      const user = userEvent.setup();
      renderWeighted();
      await user.click(screen.getByRole('button', { name: /select columns/i }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Email')).toBeInTheDocument();
      expect(
        within(dialog).queryByText('Gamification'),
      ).not.toBeInTheDocument();
      expect(within(dialog).queryByText('Level')).not.toBeInTheDocument();
      expect(within(dialog).queryByText('Total XP')).not.toBeInTheDocument();
    });

    it('puts the select-all checkbox in an indeterminate state on a partial selection', async () => {
      const user = userEvent.setup();
      renderWeighted({
        students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
      });
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // select one of two rows
      await waitFor(() =>
        // MUI marks the indeterminate checkbox input with data-indeterminate="true"
        expect(checkboxes[0]).toHaveAttribute('data-indeterminate', 'true'),
      );
    });
  });

  describe('truncation tooltips', () => {
    it('shows a tooltip with the student name on hover', async () => {
      const user = userEvent.setup();
      renderWeighted({ students: [makeStudent(1, 'Alice')] });
      await user.hover(screen.getByText('Alice'));
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Alice');
    });

    it('shows a tooltip with the tab title on hover of the tab header', async () => {
      const user = userEvent.setup();
      renderWeighted({ tabs: [makeTab(10, 'Recitation Quizzes', 1, 100)] });
      await user.hover(screen.getByText('Recitation Quizzes'));
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Recitation Quizzes',
      );
    });

    it('shows a tooltip with the email on hover when the Email column is shown', async () => {
      const user = userEvent.setup();
      localStorage.setItem(
        WEIGHTED_STORAGE_KEY,
        JSON.stringify({ email: true }),
      );
      const { email } = makeStudent(1, 'Alice');
      renderWeighted({ students: [makeStudent(1, 'Alice')] });
      await user.hover(screen.getByText(email));
      expect(await screen.findByRole('tooltip')).toHaveTextContent(email);
    });

    it('shows a tooltip with the assessment title on hover of a breakdown row title', async () => {
      const user = userEvent.setup();
      renderWeighted({
        students: [makeStudent(1, 'Alice')],
        tabs: [makeTab(10, 'Tab 1', 1, 100)],
        assessments: [makeAssessment(100, 'Mission 1', 10, 10)],
        submissions: [makeSub(1, 100, 5)],
      });
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      await user.hover(await screen.findByText('Mission 1'));
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Mission 1');
    });
  });

  describe('name column auto-expands with row breakdown', () => {
    // colgroup order: checkbox(0) | name(1) | [email] | [externalId] | tabs | total
    const nameCol = (): HTMLElement =>
      document.querySelectorAll('colgroup col')[1] as HTMLElement;

    it('keeps the Name column collapsed while all rows are collapsed', () => {
      renderWeighted({ students: [makeStudent(1, 'Alice')] });
      expect(nameCol().style.width).toBe('150px');
    });

    // The total column's <col> must carry an explicit width: in the fixed table
    // layout a width-less <col> collapses to 0 once the other (fixed) columns
    // fill the table — which hid the Weighted Total column entirely whenever the
    // External ID column was also shown.
    it('gives the total column an explicit width so it never collapses', () => {
      renderWeighted({ students: [makeStudent(1, 'Alice')] });
      const cols = document.querySelectorAll('colgroup col');
      const totalCol = cols[cols.length - 1] as HTMLElement;
      expect(totalCol.style.width).not.toBe('');
    });

    it('widens the Name column when a row is expanded and restores it on collapse', async () => {
      const user = userEvent.setup();
      renderWeighted({
        students: [makeStudent(1, 'Alice')],
        tabs: [makeTab(10, 'Tab 1', 1, 100)],
        assessments: [makeAssessment(100, 'Mission 1', 10, 10)],
        submissions: [makeSub(1, 100, 5)],
      });
      expect(nameCol().style.width).toBe('150px');

      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      expect(nameCol().style.width).toBe('260px');

      await user.click(screen.getByRole('button', { name: /collapse Alice/i }));
      expect(nameCol().style.width).toBe('150px');
    });
  });

  describe('row-expand breakdown', () => {
    const expandable = {
      tabs: [makeTab(10, 'Missions', 1, 60), makeTab(20, 'Quizzes', 1, 40)],
      assessments: [
        makeAssessment(1, 'Mission 1', 10, 100),
        makeAssessment(2, 'Mission 2', 10, 50),
        makeAssessment(3, 'Quiz 1', 20, 100),
      ],
      students: [makeStudent(1, 'Alice')],
      submissions: [
        makeSub(1, 1, 80), // 0.8
        makeSub(1, 2, 50), // 1.0
        makeSub(1, 3, 90), // 0.9
      ],
    };

    it('renders an expand control on each student row', () => {
      renderWeighted(expandable);
      expect(
        screen.getByRole('button', { name: /expand Alice/i }),
      ).toBeInTheDocument();
    });

    it('does not show assessment breakdown until expanded', () => {
      renderWeighted(expandable);
      expect(screen.queryByText(/Mission 1/)).not.toBeInTheDocument();
    });

    it('shows per-assessment grade and points after expanding, and hides on collapse', async () => {
      const user = userEvent.setup();
      renderWeighted(expandable);
      const toggle = screen.getByRole('button', { name: /expand Alice/i });
      await user.click(toggle);
      // grade/max shown in the muted "raw · weightage" subtitle
      expect(await screen.findByText(/Mission 1/)).toBeInTheDocument();
      expect(screen.getByText(/80\/100 ·/)).toBeInTheDocument();
      // points contribution: Mission 1 = (0.8/2)*60 = 24
      const detail = screen.getByTestId(breakdownRowId(1, 10, 1));
      expect(within(detail).getByText('24')).toBeInTheDocument();
      // collapse
      await user.click(screen.getByRole('button', { name: /collapse Alice/i }));
      await waitFor(() =>
        expect(screen.queryByText(/Mission 1/)).not.toBeInTheDocument(),
      );
    });

    it('shows only the assessment name in the breakdown, without the tab prefix', async () => {
      const user = userEvent.setup();
      renderWeighted(expandable);
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      const detail = await screen.findByTestId(breakdownRowId(1, 10, 1));
      // Assessment name shown verbatim on its own line — not tab-prefixed as
      // "Missions · Mission 1". (The "·" still appears legitimately in the muted
      // "raw · weightage" subtitle below the title.)
      expect(within(detail).getByText('Mission 1')).toBeInTheDocument();
      expect(
        within(detail).queryByText(/Missions · Mission 1/),
      ).not.toBeInTheDocument();
    });

    it('confines title + raw·weightage to the Name cell with empty identity cells (no merged span)', async () => {
      const user = userEvent.setup();
      // Surface two identity columns (Email, External ID) so we can assert the
      // breakdown row leaves them as discrete empty cells rather than spanning.
      localStorage.setItem(
        WEIGHTED_STORAGE_KEY,
        JSON.stringify({ email: true, externalId: true }),
      );
      renderWeighted(expandable);
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      const detail = await screen.findByTestId(breakdownRowId(1, 10, 1));

      // No merged cell: the breakdown row no longer spans the identity columns,
      // so it freezes the same checkbox | Name region as the student rows above
      // instead of over-freezing across the identity area.
      expect(detail.querySelectorAll('td[colspan]')).toHaveLength(0);

      // Title and the muted "raw · weightage" subtitle live in the SAME (Name)
      // cell, confined to the Name column.
      const titleCell = within(detail).getByText('Mission 1').closest('td')!;
      expect(
        within(titleCell).getByText(/80\/100 · 30% of grade/),
      ).toBeInTheDocument();

      // Each visible identity column gets its own empty cell so the grid lines
      // stay aligned with the rows above. Cells:
      // checkbox | Name | Email(empty) | External ID(empty) | Missions(24) | Quizzes | Total
      const cells = within(detail).getAllByRole('cell');
      expect(cells).toHaveLength(7);
      expect(cells[2]).toBeEmptyDOMElement();
      expect(cells[3]).toBeEmptyDOMElement();
    });

    it('aligns breakdown tab values with the parent columns when both level columns are shown', async () => {
      const user = userEvent.setup();
      renderWeighted({
        ...expandable,
        students: [
          { ...makeStudent(1, 'Alice'), level: 8, levelContribution: 15 },
        ],
        gamificationEnabled: true,
        courseMaxLevel: 30,
        levelContribution: {
          enabled: true,
          show: true,
          weight: 30,
          formula: 'level',
          clamp: true,
        },
      });
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));

      // With Raw Level + Level Contribution present and no identity columns:
      // checkbox | Name | Level | Level Contribution | Missions | Quizzes | Total
      const detail = await screen.findByTestId(breakdownRowId(1, 10, 1));
      const cells = within(detail).getAllByRole('cell');
      expect(cells).toHaveLength(7);
      // Mission 1's contribution (24) lands under Missions (index 4) — not
      // shifted left into the Level (2) or Level Contribution (3) columns.
      expect(cells[2]).toBeEmptyDOMElement(); // Raw Level
      expect(cells[3]).toBeEmptyDOMElement(); // Level Contribution
      expect(cells[4]).toHaveTextContent('24'); // Missions
    });

    it('gives every column an explicit-width colgroup <col>, including Total', () => {
      renderWeighted({
        ...expandable,
        students: [
          { ...makeStudent(1, 'Alice'), level: 8, levelContribution: 15 },
        ],
        gamificationEnabled: true,
        courseMaxLevel: 30,
        levelContribution: {
          enabled: true,
          show: true,
          weight: 30,
          formula: 'level',
          clamp: true,
        },
      });

      const cols = [...document.querySelectorAll<HTMLElement>('colgroup col')];
      const studentRow = screen.getByText('Alice').closest('tr')!;
      const cells = within(studentRow).getAllByRole('cell');
      expect(cells).toHaveLength(7);
      expect(cols).toHaveLength(cells.length);
      cols.forEach((col) => expect(col.style.width).not.toBe(''));
    });

    it('shows the level contribution in its own column on the level breakdown row', async () => {
      const user = userEvent.setup();
      renderWeighted({
        ...expandable,
        students: [
          { ...makeStudent(1, 'Alice'), level: 8, levelContribution: 15 },
        ],
        gamificationEnabled: true,
        courseMaxLevel: 30,
        levelContribution: {
          enabled: true,
          show: true,
          weight: 30,
          formula: 'level',
          clamp: true,
        },
      });
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));

      // Synthetic Level breakdown row (tabId -1, assessmentId -1): its
      // contribution (15) sits under Level Contribution, tab columns stay empty.
      const levelRow = await screen.findByTestId(breakdownRowId(1, -1, -1));
      const cells = within(levelRow).getAllByRole('cell');
      expect(cells).toHaveLength(7);
      expect(cells[3]).toHaveTextContent('15'); // Level Contribution
      expect(cells[4]).toBeEmptyDOMElement(); // Missions empty on the level row
    });

    it('renders each assessment as a grade/maxGrade percentage in percent mode', async () => {
      const user = userEvent.setup();
      renderWeighted(expandable);
      await user.click(screen.getByRole('radio', { name: /percentage/i }));
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      // Mission 1: 80/100 → 80% ; Mission 2: 50/50 → 100% ; Quiz 1: 90/100 → 90%
      expect(
        within(screen.getByTestId(breakdownRowId(1, 10, 1))).getByText('80%'),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId(breakdownRowId(1, 10, 2))).getByText('100%'),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId(breakdownRowId(1, 20, 3))).getByText('90%'),
      ).toBeInTheDocument();
    });

    it('renders — for an ungraded assessment in percent mode', async () => {
      const user = userEvent.setup();
      renderWeighted({
        tabs: [makeTab(10, 'Missions', 1, 100)],
        assessments: [makeAssessment(1, 'Mission 1', 10, 100)],
        students: [makeStudent(1, 'Alice')],
        submissions: [makeSub(1, 1, null)],
      });
      await user.click(screen.getByRole('radio', { name: /percentage/i }));
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      expect(
        within(screen.getByTestId(breakdownRowId(1, 10, 1))).getByText('—'),
      ).toBeInTheDocument();
    });

    it('breakdown points for a tab sum to the tab cell shown on the main row', async () => {
      const user = userEvent.setup();
      renderWeighted(expandable);
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      // Missions cell (main row) = 24 + 30 = 54
      expect(screen.getByText('54')).toBeInTheDocument();
      // and both contributions are present in the detail
      expect(
        within(screen.getByTestId(breakdownRowId(1, 10, 1))).getByText('24'),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId(breakdownRowId(1, 10, 2))).getByText('30'),
      ).toBeInTheDocument();
    });

    it('shows each assessment\'s effective weightage as "% of grade" (equal mode)', async () => {
      const user = userEvent.setup();
      renderWeighted(expandable);
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      // Missions weight 60 split across 2 assessments → 30% each;
      // Quizzes weight 40 with a single assessment → 40%.
      expect(
        within(await screen.findByTestId(breakdownRowId(1, 10, 1))).getByText(
          /30% of grade/,
        ),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId(breakdownRowId(1, 10, 2))).getByText(
          /30% of grade/,
        ),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId(breakdownRowId(1, 20, 3))).getByText(
          /40% of grade/,
        ),
      ).toBeInTheDocument();
    });

    it('shows effective weightage as "% of grade" regardless of the points/percentage lens', async () => {
      const user = userEvent.setup();
      renderWeighted(expandable);
      await user.click(screen.getByRole('radio', { name: /percentage/i }));
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      // The weightage label never follows the lens: still "30% of grade".
      expect(
        within(await screen.findByTestId(breakdownRowId(1, 10, 1))).getByText(
          /30% of grade/,
        ),
      ).toBeInTheDocument();
    });

    it('marks an excluded assessment in the breakdown with "Excluded" text and a — contribution cell', async () => {
      const user = userEvent.setup();
      renderWeighted({
        tabs: [makeTab(10, 'Missions', 1, 60)],
        assessments: [
          makeAssessment(1, 'Mission 1', 10, 100),
          {
            ...makeAssessment(2, 'Mission 2', 10, 100),
            gradebookExcluded: true,
          },
        ],
        students: [makeStudent(1, 'Alice')],
        submissions: [makeSub(1, 1, 80), makeSub(1, 2, 100)],
      });
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      const detail = await screen.findByTestId(breakdownRowId(1, 10, 2));
      // "Excluded" label present instead of "… · X% of grade" weightage text
      expect(within(detail).getByText(/Excluded/i)).toBeInTheDocument();
      // Contribution cell shows — (dash), not a numeric value
      expect(within(detail).getByText('—')).toBeInTheDocument();
      expect(within(detail).queryByText(/^[\d.]+$/)).not.toBeInTheDocument();
    });

    it('renders 0 (not —) for an ungraded-but-counted assessment, distinguishing it from excluded', async () => {
      const user = userEvent.setup();
      renderWeighted({
        tabs: [makeTab(10, 'Missions', 1, 60)],
        assessments: [makeAssessment(1, 'Mission 1', 10, 100)],
        students: [makeStudent(1, 'Alice')],
        submissions: [], // ungraded — no submission
      });
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      const detail = await screen.findByTestId(breakdownRowId(1, 10, 1));
      // Ungraded counted as 0 in points mode
      expect(within(detail).getByText('0')).toBeInTheDocument();
      // No "Excluded" text
      expect(within(detail).queryByText(/Excluded/i)).not.toBeInTheDocument();
    });

    it("uses the assessment's own weight for effective weightage in custom mode", async () => {
      const user = userEvent.setup();
      renderWeighted({
        tabs: [
          {
            id: 10,
            title: 'Missions',
            categoryId: 1,
            gradebookWeight: 60,
            weightMode: 'custom',
          },
        ],
        assessments: [
          {
            id: 1,
            title: 'Mission 1',
            tabId: 10,
            maxGrade: 100,
            gradebookWeight: 25,
          },
          {
            id: 2,
            title: 'Mission 2',
            tabId: 10,
            maxGrade: 50,
            gradebookWeight: 35,
          },
        ],
        students: [makeStudent(1, 'Alice')],
        submissions: [makeSub(1, 1, 80), makeSub(1, 2, 50)],
      });
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      expect(
        within(await screen.findByTestId(breakdownRowId(1, 10, 1))).getByText(
          /25% of grade/,
        ),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId(breakdownRowId(1, 10, 2))).getByText(
          /35% of grade/,
        ),
      ).toBeInTheDocument();
    });

    it('rounds a fractional effective weightage to 2dp in the breakdown', async () => {
      const user = userEvent.setup();
      // Tab weight 100 split equally across 3 assessments → 33.333…% → "33.33% of grade"
      renderWeighted({
        tabs: [makeTab(10, 'Missions', 1, 100)],
        assessments: [
          makeAssessment(1, 'M1', 10, 100),
          makeAssessment(2, 'M2', 10, 100),
          makeAssessment(3, 'M3', 10, 100),
        ],
        students: [makeStudent(1, 'Alice')],
        submissions: [makeSub(1, 1, 50)],
      });
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      expect(
        within(await screen.findByTestId(breakdownRowId(1, 10, 1))).getByText(
          /33\.33% of grade/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('display mode toggle — values', () => {
    // weight 100, one assessment max 100, grade 80 → subtotal 0.8
    // points cell = 80 ; percent cell = 80%
    const singleTab = {
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Q1', 10, 100)],
      students: [makeStudent(1, 'Alice')],
      submissions: [makeSub(1, 100, 80)],
    };

    it('shows points (no % suffix) by default', () => {
      renderWeighted(singleTab);
      expect(screen.getAllByText('80').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('80%')).not.toBeInTheDocument();
    });

    it('shows percentage with % suffix after switching to Percentage', async () => {
      const user = userEvent.setup();
      renderWeighted(singleTab);
      await user.click(screen.getByRole('radio', { name: /percentage/i }));
      await waitFor(() =>
        expect(screen.getAllByText('80%').length).toBeGreaterThanOrEqual(1),
      );
    });

    it('normalizes the total in percent mode when weights do not sum to 100', async () => {
      const user = userEvent.setup();
      // weight 50, max 100, grade 80 → subtotal 0.8
      // points total = 40 ; percent total = 40 / 50 * 100 = 80%
      renderWeighted({
        tabs: [makeTab(10, 'Tab 1', 1, 50)],
        assessments: [makeAssessment(100, 'Q1', 10, 100)],
        students: [makeStudent(1, 'Alice')],
        submissions: [makeSub(1, 100, 80)],
      });
      expect(screen.getAllByText('40').length).toBeGreaterThanOrEqual(1); // points default
      await user.click(screen.getByRole('radio', { name: /percentage/i }));
      await waitFor(() =>
        expect(screen.getAllByText('80%').length).toBeGreaterThanOrEqual(1),
      );
    });

    it('shows the Points and Percentage explanatory tooltips on hover', async () => {
      renderWeighted();
      await userEvent.hover(screen.getByRole('radio', { name: /points/i }));
      await waitFor(() =>
        expect(
          screen.getByText(/columns add up to the projected total/i),
        ).toBeInTheDocument(),
      );
      await userEvent.hover(screen.getByRole('radio', { name: /percentage/i }));
      await waitFor(() =>
        expect(
          screen.getByText(/what fraction of each tab the student earned/i),
        ).toBeInTheDocument(),
      );
    });
  });

  describe('display mode toggle — control', () => {
    it('renders Points and Percentage toggle buttons with Points pressed by default', () => {
      renderWeighted();
      const points = screen.getByRole('radio', { name: /points/i });
      const percent = screen.getByRole('radio', { name: /percentage/i });
      expect(points).toBeInTheDocument();
      expect(percent).toBeInTheDocument();
      expect(points).toHaveAttribute('aria-checked', 'true');
      expect(percent).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('identity columns rendering', () => {
    it('hides Email and External ID by default', () => {
      renderWeighted();
      expect(screen.queryByText('Email')).not.toBeInTheDocument();
      expect(screen.queryByText(EXTERNAL_ID)).not.toBeInTheDocument();
      expect(screen.queryByText(ALICE_EMAIL)).not.toBeInTheDocument();
    });

    it('shows the Email column header and value when Email is enabled via storage', async () => {
      localStorage.setItem(
        WEIGHTED_STORAGE_KEY,
        JSON.stringify({ email: true }),
      );
      renderWeighted({ students: [makeStudent(1, 'Alice')] });
      // header cell
      const thead = document.querySelector('thead')!;
      expect(
        within(thead as HTMLElement).getByText('Email'),
      ).toBeInTheDocument();
      // body value
      expect(screen.getByText(ALICE_EMAIL)).toBeInTheDocument();
    });

    it('does not render Level or Total XP columns even if storage enables them', () => {
      localStorage.setItem(
        WEIGHTED_STORAGE_KEY,
        JSON.stringify({ level: true, totalXp: true }),
      );
      renderWeighted();
      const thead = document.querySelector('thead')!;
      expect(
        within(thead as HTMLElement).queryByText('Level'),
      ).not.toBeInTheDocument();
      expect(
        within(thead as HTMLElement).queryByText('Total XP'),
      ).not.toBeInTheDocument();
    });

    describe('external ID column', () => {
      const studentsWithExtId: StudentData[] = [
        { ...makeStudent(1, 'Alice'), externalId: 'EXT-001' },
        { ...makeStudent(2, 'Bob'), externalId: null },
      ];

      it('shows External ID column by default when a student has one', async () => {
        renderWeighted({ students: studentsWithExtId });
        await screen.findByText('Alice');
        const thead = document.querySelector('thead')!;
        expect(
          within(thead as HTMLElement).getByText(EXTERNAL_ID),
        ).toBeInTheDocument();
        expect(screen.getByText('EXT-001')).toBeInTheDocument();
        // Bob has no external ID → his External ID cell renders empty, not "null".
        const bobRow = screen.getByText('Bob').closest('tr')!;
        expect(within(bobRow).queryByText('null')).not.toBeInTheDocument();
      });

      it('hides External ID column by default when no student has one', async () => {
        renderWeighted();
        await screen.findByText('Alice');
        expect(screen.queryByText(EXTERNAL_ID)).not.toBeInTheDocument();
      });

      it('treats a blank external ID as absent and hides the column by default', async () => {
        renderWeighted({
          students: [{ ...makeStudent(1, 'Alice'), externalId: '' }],
        });
        await screen.findByText('Alice');
        expect(screen.queryByText(EXTERNAL_ID)).not.toBeInTheDocument();
      });

      it('shows External ID when enabled via localStorage even with no external IDs', async () => {
        localStorage.setItem(
          WEIGHTED_STORAGE_KEY,
          JSON.stringify({ externalId: true }),
        );
        renderWeighted();
        await screen.findByText('Alice');
        const thead = document.querySelector('thead')!;
        expect(
          within(thead as HTMLElement).getByText(EXTERNAL_ID),
        ).toBeInTheDocument();
      });

      it('offers External ID checkbox in picker regardless of whether students have one', async () => {
        const user = userEvent.setup();
        renderWeighted();
        await user.click(
          await screen.findByRole('button', { name: /select columns/i }),
        );
        const dialog = await screen.findByRole('dialog');
        expect(
          within(dialog).getByRole('checkbox', { name: /external id/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('projected-total policy', () => {
    it('shows a "Weighted Total" header without the inline policy sentence', () => {
      renderWeighted();
      const thead = document.querySelector('thead')!;
      expect(
        within(thead as HTMLElement).getByText('Weighted Total'),
      ).toBeInTheDocument();
      // The policy is no longer crammed into the header label itself.
      expect(
        within(thead as HTMLElement).queryByText(/ungraded assessments/i),
      ).not.toBeInTheDocument();
    });

    it('exposes the projected-total policy via an ⓘ control on the header', () => {
      renderWeighted();
      expect(
        screen.getByRole('button', {
          name: /ungraded assessments as 0/i,
        }),
      ).toBeInTheDocument();
    });

    it('reveals the projected-total policy text in the header ⓘ tooltip on hover', async () => {
      renderWeighted();
      await userEvent.hover(
        screen.getByRole('button', { name: /ungraded assessments as 0/i }),
      );
      await waitFor(() =>
        expect(
          screen.getAllByText(/totals count ungraded assessments as 0/i).length,
        ).toBeGreaterThanOrEqual(1),
      );
    });

    it('shows a one-time projected-total policy banner that can be dismissed', async () => {
      const user = userEvent.setup();
      renderWeighted();
      expect(
        screen.getByText(/totals count ungraded assessments as 0/i),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(
        screen.queryByText(/totals count ungraded assessments as 0/i),
      ).not.toBeInTheDocument();
    });

    it('does not show the policy banner once it has been dismissed', () => {
      localStorage.setItem(
        `${USER_ID}:gradebook_projected_total_policy_hint`,
        'true',
      );
      renderWeighted();
      expect(
        screen.queryByText(/totals count ungraded assessments as 0/i),
      ).not.toBeInTheDocument();
      // The ⓘ on the header still carries the policy after dismissal.
      expect(
        screen.getByRole('button', {
          name: /ungraded assessments as 0/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('all-excluded tab (effective weight 0)', () => {
    const excluded = (a: AssessmentData): AssessmentData => ({
      ...a,
      gradebookExcluded: true,
    });

    // Assignments (30) is fully excluded → contributes nothing; Quizzes (70) is live.
    const oneTabAllExcluded = {
      tabs: [makeTab(10, 'Assignments', 1, 30), makeTab(11, 'Quizzes', 1, 70)],
      assessments: [
        excluded(makeAssessment(100, 'A1', 10, 100)),
        excluded(makeAssessment(101, 'A2', 10, 100)),
        makeAssessment(200, 'Q1', 11, 100),
      ],
    };

    const row3 = (): HTMLElement =>
      document.querySelector('thead')!.querySelectorAll('tr')[2] as HTMLElement;

    it('row 3 reads "Excluded" instead of /N for an all-excluded tab (points)', () => {
      renderWeighted(oneTabAllExcluded);
      expect(within(row3()).getByText('Excluded')).toBeInTheDocument();
      // The dead tab's stored weight is never shown as a "/30" subheader.
      expect(screen.queryByText('/30')).not.toBeInTheDocument();
    });

    it('row 3 reads "Excluded" instead of "% of grade" for an all-excluded tab (percent)', async () => {
      const user = userEvent.setup();
      renderWeighted(oneTabAllExcluded);
      await user.click(screen.getByRole('radio', { name: /percentage/i }));
      expect(within(row3()).getByText('Excluded')).toBeInTheDocument();
      expect(screen.queryByText('30% of grade')).not.toBeInTheDocument();
    });

    it('drops the all-excluded tab from the projected-total weight (header)', () => {
      renderWeighted(oneTabAllExcluded);
      // Live weight is only Quizzes (70), so the total header shows /70, not /100.
      expect(screen.queryByText('/100')).not.toBeInTheDocument();
      const cells = row3().querySelectorAll('th');
      expect(cells[cells.length - 1]).toHaveTextContent('/70');
    });

    it('normalizes the percent-mode total over live weight only', async () => {
      const user = userEvent.setup();
      renderWeighted({
        ...oneTabAllExcluded,
        students: [makeStudent(1, 'Alice')],
        submissions: [makeSub(1, 200, 90)], // 0.9 on the only live tab (Quizzes/70)
      });
      await user.click(screen.getByRole('radio', { name: /percentage/i }));
      // Total points = 0.9×70 = 63. Normalized over live weight (70): 63/70 = 90%.
      // The buggy denominator (100) would render 63%.
      const aliceRow = screen.getByText('Alice').closest('tr')!;
      const cells = within(aliceRow).getAllByRole('cell');
      expect(cells[cells.length - 1]).toHaveTextContent('90%');
    });

    it('renders "—" for the total in percent mode when all live weight is excluded', async () => {
      const user = userEvent.setup();
      renderWeighted({
        tabs: [makeTab(10, 'Assignments', 1, 30)],
        assessments: [
          excluded(makeAssessment(100, 'A1', 10, 100)),
          excluded(makeAssessment(101, 'A2', 10, 100)),
        ],
        students: [makeStudent(1, 'Alice')],
        submissions: [makeSub(1, 100, 80)],
      });
      await user.click(screen.getByRole('radio', { name: /percentage/i }));
      const aliceRow = screen.getByText('Alice').closest('tr')!;
      const cells = within(aliceRow).getAllByRole('cell');
      expect(cells[cells.length - 1]).toHaveTextContent('—');
    });
  });

  describe('single-open accordion', () => {
    it('keeps only one student expanded at a time (opening another collapses the first)', async () => {
      const user = userEvent.setup();
      renderWeighted({
        tabs: [makeTab(10, 'Missions', 1, 100)],
        assessments: [makeAssessment(1, 'Mission 1', 10, 100)],
        students: [makeStudent(1, 'Alice'), makeStudent(2, 'Bob')],
        submissions: [makeSub(1, 1, 80), makeSub(2, 1, 60)],
      });

      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      expect(
        await screen.findByTestId(breakdownRowId(1, 10, 1)),
      ).toBeInTheDocument();

      // Opening Bob must collapse Alice.
      await user.click(screen.getByRole('button', { name: /expand Bob/i }));
      expect(
        await screen.findByTestId(breakdownRowId(2, 10, 1)),
      ).toBeInTheDocument();
      await waitFor(() =>
        expect(
          screen.queryByTestId(breakdownRowId(1, 10, 1)),
        ).not.toBeInTheDocument(),
      );
    });

    it('keeps focus on the toggle after expanding (keyboard users stay put)', async () => {
      const user = userEvent.setup();
      renderWeighted({
        tabs: [makeTab(10, 'Missions', 1, 100)],
        assessments: [makeAssessment(1, 'Mission 1', 10, 100)],
        students: [makeStudent(1, 'Alice')],
        submissions: [makeSub(1, 1, 80)],
      });
      const toggle = screen.getByRole('button', { name: /expand Alice/i });
      await user.click(toggle);
      // Same DOM button (label flips expand→collapse), so focus is retained.
      expect(
        screen.getByRole('button', { name: /collapse Alice/i }),
      ).toHaveFocus();
    });
  });

  describe('pinned summary row', () => {
    // Enable both optional identity columns so the assertion covers the cells
    // that the per-cell pinning used to miss (and stands in for any future
    // optional column, e.g. level / level contribution).
    const expandedRow = async (): Promise<HTMLTableRowElement> => {
      localStorage.setItem(
        WEIGHTED_STORAGE_KEY,
        JSON.stringify({ email: true, externalId: true }),
      );
      const user = userEvent.setup();
      renderWeighted({
        tabs: [makeTab(10, 'Missions', 1, 60), makeTab(20, 'Quizzes', 1, 40)],
        assessments: [
          makeAssessment(1, 'Mission 1', 10, 100),
          makeAssessment(3, 'Quiz 1', 20, 100),
        ],
        students: [{ ...makeStudent(1, 'Alice'), externalId: 'EXT-001' }],
        submissions: [makeSub(1, 1, 80), makeSub(1, 3, 90)],
      });
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      return screen
        .getByRole('button', { name: /collapse Alice/i })
        .closest('tr') as HTMLTableRowElement;
    };

    // jsdom can't lay out `position: sticky`, but getComputedStyle resolves the
    // emotion class, so a pinned cell reports a concrete `top` (0px here, since
    // the measured header height is 0 without layout) while an un-pinned sticky
    // cell reports an empty `top`. That distinguishes a torn row from a whole one.
    it('pins every cell of the expanded row beneath the header, identity columns included', async () => {
      const row = await expandedRow();
      const cells = Array.from(row.querySelectorAll('td'));
      // checkbox | Name | Email | External ID | Missions | Quizzes | Total
      expect(cells).toHaveLength(7);
      cells.forEach((cell) => {
        const cs = getComputedStyle(cell);
        expect(cs.position).toBe('sticky');
        expect(cs.top).not.toBe('');
      });
    });

    it('does not pin a collapsed student row', () => {
      localStorage.setItem(
        WEIGHTED_STORAGE_KEY,
        JSON.stringify({ email: true, externalId: true }),
      );
      renderWeighted({
        students: [{ ...makeStudent(1, 'Alice'), externalId: 'EXT-001' }],
      });
      const row = screen
        .getByRole('button', { name: /expand Alice/i })
        .closest('tr') as HTMLTableRowElement;
      // The data/identity cells are not sticky at all while collapsed.
      const emailCell = within(row).getByText(ALICE_EMAIL).closest('td')!;
      expect(getComputedStyle(emailCell).top).toBe('');
    });
  });

  describe('auto-scroll on expand', () => {
    const one = {
      tabs: [makeTab(10, 'Missions', 1, 100)],
      assessments: [makeAssessment(1, 'Mission 1', 10, 100)],
      students: [makeStudent(1, 'Alice')],
      submissions: [makeSub(1, 1, 80)],
    };

    afterEach(() => {
      // Restore the scrollTo we stub in (jsdom doesn't implement it).
      delete (Element.prototype as unknown as { scrollTo?: unknown }).scrollTo;
    });

    it('smooth-scrolls the expanded row into view by default', async () => {
      const scrollSpy = jest.fn();
      (Element.prototype as unknown as { scrollTo: unknown }).scrollTo =
        scrollSpy;
      const user = userEvent.setup();
      renderWeighted(one);
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      await waitFor(() => expect(scrollSpy).toHaveBeenCalled());
      expect(scrollSpy.mock.calls[0][0]).toMatchObject({ behavior: 'smooth' });
    });

    it('jumps instantly when the user prefers reduced motion', async () => {
      const scrollSpy = jest.fn();
      (Element.prototype as unknown as { scrollTo: unknown }).scrollTo =
        scrollSpy;
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = ((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: (): void => {},
        removeEventListener: (): void => {},
        addListener: (): void => {},
        removeListener: (): void => {},
        dispatchEvent: (): boolean => false,
      })) as unknown as typeof window.matchMedia;

      try {
        const user = userEvent.setup();
        renderWeighted(one);
        await user.click(screen.getByRole('button', { name: /expand Alice/i }));
        await waitFor(() => expect(scrollSpy).toHaveBeenCalled());
        expect(scrollSpy.mock.calls[0][0]).toMatchObject({ behavior: 'auto' });
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });
  });

  describe('keep-highest breakdown marker', () => {
    // One equal tab, keepHighest=1, three graded assessments. The lowest (a1) drops.
    const keepConfig = {
      tabs: [{ ...makeTab(10, 'Missions', 1, 60), keepHighest: 1 }],
      assessments: [
        makeAssessment(1, 'Mission 1', 10, 100),
        makeAssessment(2, 'Mission 2', 10, 100),
        makeAssessment(3, 'Mission 3', 10, 100),
      ],
      students: [makeStudent(1, 'Alice')],
      submissions: [makeSub(1, 1, 30), makeSub(1, 2, 60), makeSub(1, 3, 90)],
    };

    it('labels the dropped assessment "Dropped (lowest)" (not "Excluded")', async () => {
      const user = userEvent.setup();
      renderWeighted(keepConfig);
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      const detail = await screen.findByTestId(breakdownRowId(1, 10, 1));
      expect(
        within(detail).getByText(/Dropped \(lowest\)/),
      ).toBeInTheDocument();
      expect(within(detail).queryByText(/Excluded/i)).not.toBeInTheDocument();
    });

    it('shows 0 (not —) in the dropped assessment cell in points mode', async () => {
      const user = userEvent.setup();
      renderWeighted(keepConfig);
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      const detail = await screen.findByTestId(breakdownRowId(1, 10, 1));
      // Dropped contributes 0 points — distinct from excluded's em dash.
      expect(within(detail).getByText('0')).toBeInTheDocument();
      expect(within(detail).queryByText('—')).not.toBeInTheDocument();
    });

    it("shows the dropped assessment's own grade % in percentage mode", async () => {
      const user = userEvent.setup();
      renderWeighted(keepConfig);
      await user.click(screen.getByRole('radio', { name: /percentage/i }));
      await user.click(screen.getByRole('button', { name: /expand Alice/i }));
      const detail = await screen.findByTestId(breakdownRowId(1, 10, 1));
      // a1 = 30/100 = 30% — visible so the instructor sees the dropped grade.
      expect(within(detail).getByText('30%')).toBeInTheDocument();
    });
  });
});

describe('level contribution columns', () => {
  beforeEach(() => localStorage.clear());

  // `enabled` drives the always-on "Level Contribution" column; `show`
  // additionally drives the raw "Level" column. Formula uses only the `level`
  // grammar variable so these tests assert layout without coupling to the
  // contribution-value computation (owned elsewhere).
  const levelOn = {
    enabled: true,
    formula: 'level',
    weight: 10,
    show: true,
    clamp: true,
  };

  // The first <thead> row carries every column's top header cell left-to-right
  // (Name, raw Level, Level Contribution, category groups, Total) — the cleanest
  // place to assert presence and ordering.
  const headerRow1 = (): HTMLElement =>
    document.querySelector('thead tr') as HTMLElement;

  it('shows neither level column when gamification is off', () => {
    renderWeighted({ gamificationEnabled: false, levelContribution: levelOn });
    expect(screen.queryByText(LEVEL_CONTRIBUTION)).not.toBeInTheDocument();
    expect(screen.queryByText('Level')).not.toBeInTheDocument();
  });

  it('shows neither level column when the contribution is disabled', () => {
    renderWeighted({
      gamificationEnabled: true,
      levelContribution: { ...levelOn, enabled: false },
    });
    expect(screen.queryByText(LEVEL_CONTRIBUTION)).not.toBeInTheDocument();
    expect(screen.queryByText('Level')).not.toBeInTheDocument();
  });

  it('shows Level Contribution but hides raw Level when show is off', () => {
    renderWeighted({
      gamificationEnabled: true,
      levelContribution: { ...levelOn, show: false },
    });
    expect(
      within(headerRow1()).getByText(LEVEL_CONTRIBUTION),
    ).toBeInTheDocument();
    expect(within(headerRow1()).queryByText('Level')).not.toBeInTheDocument();
  });

  it('shows both Level Contribution and raw Level when enabled and show are on', () => {
    renderWeighted({ gamificationEnabled: true, levelContribution: levelOn });
    expect(
      within(headerRow1()).getByText(LEVEL_CONTRIBUTION),
    ).toBeInTheDocument();
    expect(within(headerRow1()).getByText('Level')).toBeInTheDocument();
  });

  it('orders raw Level last among student info and Level Contribution first among contributions', () => {
    renderWeighted({
      gamificationEnabled: true,
      levelContribution: levelOn,
      students: [{ ...makeStudent(1, 'Alice'), externalId: 'EXT-1' }],
    });
    const headers = within(headerRow1())
      .getAllByRole('columnheader')
      .map((c) => c.textContent);
    const ext = headers.indexOf('External ID');
    const raw = headers.indexOf('Level');
    const contrib = headers.indexOf(LEVEL_CONTRIBUTION);
    const cat = headers.indexOf('Cat A');
    // External ID (student info) < raw Level (last student info) < Level
    // Contribution (first contribution) < Cat A (tab group).
    expect(ext).toBeLessThan(raw);
    expect(raw).toBeLessThan(contrib);
    expect(contrib).toBeLessThan(cat);
  });

  it("renders each student's actual level in the raw Level column", () => {
    renderWeighted({
      gamificationEnabled: true,
      // level * 2 keeps the contribution value (14) distinct from the raw level
      // (7) so the assertion targets the raw Level cell unambiguously.
      levelContribution: { ...levelOn, formula: 'level * 2' },
      students: [{ ...makeStudent(1, 'Alice'), level: 7 }],
    });
    const aliceRow = screen.getByText('Alice').closest('tr')!;
    expect(within(aliceRow).getByText('7')).toBeInTheDocument();
  });

  it('lists the Level row first in the expanded breakdown', async () => {
    const user = userEvent.setup();
    renderWeighted({
      gamificationEnabled: true,
      levelContribution: { ...levelOn, formula: 'level' },
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Quiz 1', 10, 10)],
      // BE pre-computes the per-student contribution; Alice (level 1) under
      // formula 'level' → 1. The component renders this value, not the formula.
      students: [{ ...makeStudent(1, 'Alice'), levelContribution: 1 }],
      submissions: [makeSub(1, 100, 8)],
    });
    await user.click(screen.getByRole('button', { name: /expand Alice/i }));
    const bdRows = await screen.findAllByTestId(/^breakdown-row-/);
    // Synthetic level tab uses LEVEL_TAB_ID (-1); its row must come first, before
    // the real tab (id 10) rows — mirroring the column order.
    expect(bdRows[0].getAttribute('data-testid')).toMatch(
      /^breakdown-row-1--1-/,
    );
    expect(
      bdRows.some((r) => r.getAttribute('data-testid')?.includes('-10-')),
    ).toBe(true);
  });

  it('shows the raw level (no max-level denominator) in the Level breakdown row', async () => {
    const user = userEvent.setup();
    renderWeighted({
      gamificationEnabled: true,
      // courseMaxLevel plays no part in the contribution, so showing "14/20"
      // would falsely imply a level/maxLevel derivation. Expect a plain "Level 14".
      levelContribution: { ...levelOn, formula: 'level', weight: 20 },
      courseMaxLevel: 20,
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Quiz 1', 10, 10)],
      // BE-supplied contribution; Alice (level 14) under formula 'level' → 14.
      students: [
        { ...makeStudent(1, 'Alice'), level: 14, levelContribution: 14 },
      ],
      submissions: [makeSub(1, 100, 8)],
    });
    await user.click(screen.getByRole('button', { name: /expand Alice/i }));
    const levelRow = (await screen.findAllByTestId(/^breakdown-row-1--1-/))[0];
    expect(within(levelRow).getByText(/Level 14/)).toBeInTheDocument();
    // The misleading "14/20" fraction must NOT appear.
    expect(
      within(levelRow).queryByText(/14\s*\/\s*\d+/),
    ).not.toBeInTheDocument();
  });

  // Percent lens: the Level Contribution column is stored in points but, like every
  // other category column, renders as "% of this component earned" in percent mode —
  // i.e. contribution / weight × 100, NOT the raw points with a stray "%" suffix.
  it('renders the level contribution as a percentage of its weight in percent mode', async () => {
    const user = userEvent.setup();
    renderWeighted({
      gamificationEnabled: true,
      levelContribution: { ...levelOn, formula: 'level', weight: 30 },
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Quiz 1', 10, 10)],
      // BE-supplied contribution: 15 pts out of a 30-pt budget.
      students: [
        { ...makeStudent(1, 'Alice'), level: 8, levelContribution: 15 },
      ],
      submissions: [makeSub(1, 100, 8)],
    });
    await user.click(screen.getByRole('radio', { name: /percentage/i }));
    const aliceRow = screen.getByText('Alice').closest('tr')!;
    // 15 / 30 → 50%, mirroring how a tab cell shows the fraction of that tab earned.
    expect(within(aliceRow).getByText('50%')).toBeInTheDocument();
  });

  it('renders the level breakdown row as a percentage of the weight in percent mode', async () => {
    const user = userEvent.setup();
    renderWeighted({
      gamificationEnabled: true,
      levelContribution: { ...levelOn, formula: 'level', weight: 30 },
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Quiz 1', 10, 10)],
      students: [
        { ...makeStudent(1, 'Alice'), level: 8, levelContribution: 15 },
      ],
      submissions: [makeSub(1, 100, 8)],
    });
    await user.click(screen.getByRole('radio', { name: /percentage/i }));
    await user.click(screen.getByRole('button', { name: /expand Alice/i }));
    const levelRow = (await screen.findAllByTestId(/^breakdown-row-1--1-/))[0];
    // The breakdown's level cell mirrors the summary cell: 15 / 30 → 50%.
    expect(within(levelRow).getByText('50%')).toBeInTheDocument();
  });

  it('lets an over-budget level contribution read past 100% in percent mode', async () => {
    const user = userEvent.setup();
    renderWeighted({
      gamificationEnabled: true,
      // clamp off + a formula that overshoots: BE supplies the raw 45 pts.
      levelContribution: {
        ...levelOn,
        formula: 'level',
        weight: 30,
        clamp: false,
      },
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Quiz 1', 10, 10)],
      students: [
        { ...makeStudent(1, 'Alice'), level: 45, levelContribution: 45 },
      ],
      submissions: [makeSub(1, 100, 8)],
    });
    await user.click(screen.getByRole('radio', { name: /percentage/i }));
    const aliceRow = screen.getByText('Alice').closest('tr')!;
    // 45 / 30 → 150%: the weight is a suggested max, never a cap.
    expect(within(aliceRow).getByText('150%')).toBeInTheDocument();
  });

  // Over-budget warning: the level weight is a suggested maximum, so a formula can
  // push a student's contribution past it or below 0. The Level Contribution subheader
  // shows a bound-aware message (above-only, below-only, or both).
  it('shows above-only tooltip when a student exceeds the level weight', () => {
    renderWeighted({
      gamificationEnabled: true,
      // level * 5 → Alice (level 3) contributes 15, over the 10-pt budget.
      levelContribution: { ...levelOn, formula: 'level * 5', weight: 10 },
      students: [{ ...makeStudent(1, 'Alice'), level: 3 }],
    });
    expect(
      screen.getByLabelText(/above the maximum level contributions/i),
    ).toBeInTheDocument();
  });

  it('shows below-only tooltip when a student contribution falls below 0', () => {
    renderWeighted({
      gamificationEnabled: true,
      // level - 10 → Alice (level 1) contributes -9, below 0.
      levelContribution: { ...levelOn, formula: 'level - 10', weight: 10 },
      students: [{ ...makeStudent(1, 'Alice'), level: 1 }],
    });
    expect(screen.getByLabelText(/below 0/i)).toBeInTheDocument();
  });

  it('shows both-bounds tooltip when students breach both bounds', () => {
    renderWeighted({
      gamificationEnabled: true,
      // level - 3 with weight 5: Alice (level 1) → -2 (below 0), Bob (level 10) → 7 (above 5).
      levelContribution: { ...levelOn, formula: 'level - 3', weight: 5 },
      students: [
        { ...makeStudent(1, 'Alice'), level: 1 },
        { ...makeStudent(2, 'Bob'), level: 10 },
      ],
    });
    expect(
      screen.getByLabelText(/outside the valid range/i),
    ).toBeInTheDocument();
  });

  it('does not flag the subheader when every student is within budget', () => {
    renderWeighted({
      gamificationEnabled: true,
      // level → Alice (level 3) contributes 3, within the 10-pt budget.
      levelContribution: { ...levelOn, formula: 'level', weight: 10 },
      students: [{ ...makeStudent(1, 'Alice'), level: 3 }],
    });
    expect(
      screen.queryByLabelText(
        /above the level weight|below 0|outside the valid range/i,
      ),
    ).not.toBeInTheDocument();
  });

  // Regression: neither level column is user-pickable, so a stale persisted-hidden
  // entry from a prior session must NOT keep them hidden (no picker to recover).
  it('keeps Level Contribution visible despite a stale persisted-hidden entry', () => {
    localStorage.setItem(
      WEIGHTED_STORAGE_KEY,
      JSON.stringify({ levelContribution: false }),
    );
    renderWeighted({ gamificationEnabled: true, levelContribution: levelOn });
    expect(
      within(headerRow1()).getByText(LEVEL_CONTRIBUTION),
    ).toBeInTheDocument();
  });

  it('keeps raw Level visible despite a stale persisted-hidden entry', () => {
    localStorage.setItem(
      WEIGHTED_STORAGE_KEY,
      JSON.stringify({ level: false }),
    );
    renderWeighted({ gamificationEnabled: true, levelContribution: levelOn });
    expect(within(headerRow1()).getByText('Level')).toBeInTheDocument();
  });

  // Regression: toggling settings while the table is already mounted (e.g. the
  // teacher saves the dialog) must reveal the affected column live.
  it('reveals raw Level when show is toggled on after mount', () => {
    const props = {
      assessments: [makeAssessment(100, 'Quiz 1', 10, 150)],
      canManageWeights: true,
      categories: [makeCategory(1, 'Cat A')],
      courseId: 1,
      courseMaxLevel: 10,
      courseTitle: 'Test Course',
      gamificationEnabled: true,
      students: [makeStudent(1, 'Alice')],
      submissions: [],
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
    };
    const { rerender } = render(
      <WeightedGradebookTable
        {...props}
        levelContribution={{ ...levelOn, show: false }}
      />,
      { state: userState },
    );
    expect(within(headerRow1()).queryByText('Level')).not.toBeInTheDocument();

    // rerender bypasses test-utils' TestApp wrapper, so re-wrap to keep providers.
    rerender(
      <TestApp state={userState}>
        <WeightedGradebookTable
          {...props}
          levelContribution={{ ...levelOn, show: true }}
        />
      </TestApp>,
    );
    expect(within(headerRow1()).getByText('Level')).toBeInTheDocument();
  });

  it('reveals Level Contribution when the contribution is enabled after mount', () => {
    const props = {
      assessments: [makeAssessment(100, 'Quiz 1', 10, 150)],
      canManageWeights: true,
      categories: [makeCategory(1, 'Cat A')],
      courseId: 1,
      courseMaxLevel: 10,
      courseTitle: 'Test Course',
      gamificationEnabled: true,
      students: [makeStudent(1, 'Alice')],
      submissions: [],
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
    };
    const { rerender } = render(
      <WeightedGradebookTable
        {...props}
        levelContribution={{ ...levelOn, enabled: false }}
      />,
      { state: userState },
    );
    expect(
      within(headerRow1()).queryByText(LEVEL_CONTRIBUTION),
    ).not.toBeInTheDocument();

    rerender(
      <TestApp state={userState}>
        <WeightedGradebookTable {...props} levelContribution={levelOn} />
      </TestApp>,
    );
    expect(
      within(headerRow1()).getByText(LEVEL_CONTRIBUTION),
    ).toBeInTheDocument();
  });

  it('shows a receipt icon and clamped value when a contribution is capped above', async () => {
    renderWeighted({
      gamificationEnabled: true,
      courseMaxLevel: 30,
      students: [
        { ...makeStudent(1, 'Alice'), level: 8, levelContribution: 10 },
      ],
      levelContribution: {
        enabled: true,
        show: false,
        weight: 10,
        formula: 'level * 5', // raw 40 -> clamped 10
        clamp: true,
      },
    });
    const row = screen.getByText('Alice').closest('tr')!;
    expect(within(row).getByTestId('WarningAmberIcon')).toBeInTheDocument();
  });

  it('shows no receipt icon when clamp is off', () => {
    renderWeighted({
      gamificationEnabled: true,
      courseMaxLevel: 30,
      students: [
        { ...makeStudent(1, 'Alice'), level: 8, levelContribution: 40 },
      ],
      levelContribution: {
        enabled: true,
        show: false,
        weight: 10,
        formula: 'level * 5', // raw 40, shown raw because clamp off
        clamp: false,
      },
    });
    const row = screen.getByText('Alice').closest('tr')!;
    expect(
      within(row).queryByTestId('WarningAmberIcon'),
    ).not.toBeInTheDocument();
  });

  // Divide-by-zero: the formula is mathematically undefined for this student.
  // Store/backend coerce it to null; the cell must surface 0 + a warning to
  // match the clamp cells and the dialog's "set to 0" copy.
  const divByZeroProps = {
    gamificationEnabled: true,
    courseMaxLevel: 30,
    students: [
      { ...makeStudent(1, 'Alice'), level: 8, levelContribution: null },
    ],
    levelContribution: {
      enabled: true,
      show: false,
      weight: 30,
      formula: '30 / (level - 8)', // at level 8 -> divide by zero -> NaN
      clamp: true,
    },
  };

  it('renders 0 with a warning icon when the formula divides by zero', () => {
    renderWeighted(divByZeroProps);
    // checkbox | Name | Level Contribution | Tab 1 | Total
    const cells = within(screen.getByText('Alice').closest('tr')!).getAllByRole(
      'cell',
    );
    expect(
      within(cells[2]).getByTestId('WarningAmberIcon'),
    ).toBeInTheDocument();
    expect(cells[2]).toHaveTextContent('0');
  });

  it('explains the divide-by-zero fallback in the cell tooltip on hover', async () => {
    const user = userEvent.setup();
    renderWeighted(divByZeroProps);
    const row = screen.getByText('Alice').closest('tr')!;
    await user.hover(within(row).getByTestId('WarningAmberIcon'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      /divides by zero/i,
    );
  });

  it('still shows 0 with a warning on divide-by-zero when clamp is off', () => {
    renderWeighted({
      ...divByZeroProps,
      levelContribution: { ...divByZeroProps.levelContribution, clamp: false },
    });
    const cells = within(screen.getByText('Alice').closest('tr')!).getAllByRole(
      'cell',
    );
    expect(
      within(cells[2]).getByTestId('WarningAmberIcon'),
    ).toBeInTheDocument();
    expect(cells[2]).toHaveTextContent('0');
  });
});
