import userEvent from '@testing-library/user-event';
import { store as appStore } from 'store';
import { render, screen, waitFor, within } from 'test-utils';

import GradebookWeightedTable from '../components/GradebookWeightedTable';
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
});

const makeSub = (
  studentId: number,
  assessmentId: number,
  grade: number | null,
): SubmissionData => ({ submissionId: 0, studentId, assessmentId, grade });

interface RenderWeightedOptions {
  categories?: CategoryData[];
  tabs?: TabData[];
  assessments?: AssessmentData[];
  students?: StudentData[];
  submissions?: SubmissionData[];
  canManageWeights?: boolean;
  courseTitle?: string;
  courseId?: number;
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
    <GradebookWeightedTable
      assessments={assessments}
      canManageWeights={opts.canManageWeights ?? true}
      categories={cats}
      courseId={opts.courseId ?? 1}
      courseTitle={opts.courseTitle ?? 'Test Course'}
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
describe('GradebookWeightedTable', () => {
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

  // 4b. Total column shows just "/N" on one line when sum ≠ 100 — the explanatory
  // sentence is no longer an inline second line (it lives in the tooltip instead).
  it('shows "/N" with no inline warning line when weight sum ≠ 100 in total header', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 30), makeTab(11, 'Tab 2', 1, 30)],
    });
    expect(screen.getByText('/60')).toBeInTheDocument();
    expect(screen.queryByText(/does not sum to 100/i)).not.toBeInTheDocument();
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

  // 6. Tab with no assessments → cell shows "—"
  it('shows "—" for a tab with no assessments', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Empty Tab', 1, 100)],
      assessments: [],
      students: [makeStudent(1, 'Alice')],
      submissions: [],
    });
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
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
      expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
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
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
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
    it('shows a shortened "Total" header without the inline policy sentence', () => {
      renderWeighted();
      const thead = document.querySelector('thead')!;
      expect(
        within(thead as HTMLElement).getByText('Total'),
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
  });
});
