import { fireEvent } from '@testing-library/react';
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

const USER_ID = 42;
const WEIGHTED_STORAGE_KEY = `${USER_ID}:gradebook_weighted_columns_1`;
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
): SubmissionData => ({ studentId, assessmentId, grade });

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
      gamificationEnabled={opts.gamificationEnabled ?? true}
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

  // 3. Weight subheader shows "X% of grade" per tab
  it('shows weight subheader "X% of grade" for each tab in row 3', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 30), makeTab(11, 'Tab 2', 1, 70)],
    });
    expect(screen.getByText('30% of grade')).toBeInTheDocument();
    expect(screen.getByText('70% of grade')).toBeInTheDocument();
  });

  // 4a. Total column shows "100% total" when sum = 100
  it('shows "100% total" in total column header when weights sum to 100', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 60), makeTab(11, 'Tab 2', 1, 40)],
    });
    expect(screen.getByText('100% total')).toBeInTheDocument();
  });

  // 4b. Total column shows warning text when sum ≠ 100
  it('shows a warning when weight sum ≠ 100 in total header', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 30), makeTab(11, 'Tab 2', 1, 30)],
    });
    expect(screen.getByText(/60%/)).toBeInTheDocument();
    expect(screen.getByText(/does not sum to 100/i)).toBeInTheDocument();
  });

  // 4c. Tooltip on warning header shows full message on hover
  it('warning header tooltip text is "Weights do not sum to 100. Total may be inaccurate."', async () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 60), makeTab(11, 'Tab 2', 1, 20)],
    });
    await userEvent.hover(screen.getByText(/does not sum to 100/i));
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

  // 7. Student with no graded submissions → cell shows "—"
  it('shows "—" when student has no graded submissions in a tab', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Q1', 10, 10)],
      students: [makeStudent(1, 'Alice')],
      submissions: [],
    });
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1);
  });

  // 7b. Total cell shows "—" when all tabs have null subtotals
  it('shows "—" in both the tab cell and the total cell when all tabs have null subtotals', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [makeAssessment(100, 'Q1', 10, 10)],
      students: [makeStudent(1, 'Alice')],
      submissions: [],
    });
    // tab cell = "—", total cell = "—" → at least 2 dashes
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  // 8. Total equals the sum of the row's cells
  it('total cell equals the sum of per-tab point cells', () => {
    // tab10 weight=60: subtotal=130/150 → points=52 (integer → no decimals)
    // tab20 weight=40: subtotal=0.9 → points=36 (integer → no decimals)
    // total = 52 + 36 = 88 (integer → no decimals)
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
    expect(screen.getByText('36')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
  });

  // 9. Treat Ungraded as 0 toggle changes numbers
  it('changes subtotal values when "Treat Ungraded as 0" is toggled', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 100)],
      assessments: [
        makeAssessment(100, 'Q1', 10, 50),
        makeAssessment(101, 'Q2', 10, 50),
      ],
      students: [makeStudent(1, 'Alice')],
      submissions: [makeSub(1, 100, 40)],
    });

    // Without toggle: only Q1 is graded → 40/50=0.8; weight=100 → 80 pts (integer)
    expect(screen.getAllByText('80').length).toBeGreaterThanOrEqual(1);

    // MUI Tooltip sets aria-label from its title, so the checkbox accessible name
    // is the tooltip description text, not the FormControlLabel label text.
    const toggle = screen.getByRole('checkbox', {
      name: /counts unsubmitted and ungraded/i,
    });
    fireEvent.click(toggle);

    // With toggle: 40/(50+50)=0.4; weight=100 → 40 pts (integer)
    expect(screen.getAllByText('40').length).toBeGreaterThanOrEqual(1);
  });

  // 10. All weights zero → empty-state banner visible
  it('shows empty-state banner when all weights are 0', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 0), makeTab(11, 'Tab 2', 1, 0)],
    });
    expect(screen.getByText(/no weights configured/i)).toBeInTheDocument();
  });

  // 10b. All weights zero + canManageWeights=false → "no access" message
  it('shows "no access" empty-state message when canManageWeights is false and all weights are 0', () => {
    renderWeighted({
      tabs: [makeTab(10, 'Tab 1', 1, 0)],
      canManageWeights: false,
    });
    expect(
      screen.getByText(/no tab weights have been configured yet/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/no weights configured/i),
    ).not.toBeInTheDocument();
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

  // 15. Pagination controls appear when there are more students than the page size
  it('shows pagination controls when students exceed the default page size', () => {
    const manyStudents = Array.from({ length: 15 }, (_, i) =>
      makeStudent(i + 1, `Student ${i + 1}`),
    );
    renderWeighted({ students: manyStudents });
    expect(screen.getByText('1-10 / 15')).toBeInTheDocument();
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
      // checkboxes[0] is the treatUngradedAsZero switch; [1] is header "select all"; [2] is the first row
      await user.click(checkboxes[2]);
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
      // checkboxes[1] is the header "select all" checkbox
      await user.click(checkboxes[1]);
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
      await user.click(checkboxes[2]);
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

    it('lists Email in the picker dialog, and Level/Total XP when gamification is on', async () => {
      const user = userEvent.setup();
      renderWeighted({ gamificationEnabled: true });
      await user.click(screen.getByRole('button', { name: /select columns/i }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Email')).toBeInTheDocument();
      expect(within(dialog).getByText('Level')).toBeInTheDocument();
      expect(within(dialog).getByText('Total XP')).toBeInTheDocument();
    });

    it('omits the Gamification group from the dialog when gamification is off', async () => {
      const user = userEvent.setup();
      renderWeighted({ gamificationEnabled: false });
      await user.click(screen.getByRole('button', { name: /select columns/i }));
      const dialog = await screen.findByRole('dialog');
      expect(
        within(dialog).queryByText('Gamification'),
      ).not.toBeInTheDocument();
      expect(within(dialog).queryByText('Level')).not.toBeInTheDocument();
    });
  });

  describe('identity columns rendering', () => {
    it('hides Email, External ID, Level and Total XP by default', () => {
      renderWeighted({ gamificationEnabled: true });
      expect(screen.queryByText('Email')).not.toBeInTheDocument();
      expect(screen.queryByText('External ID')).not.toBeInTheDocument();
      expect(screen.queryByText('Level')).not.toBeInTheDocument();
      expect(screen.queryByText('Total XP')).not.toBeInTheDocument();
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

    it('shows Level and Total XP values when enabled via storage and gamification is on', () => {
      localStorage.setItem(
        WEIGHTED_STORAGE_KEY,
        JSON.stringify({ level: true, totalXp: true }),
      );
      renderWeighted({
        gamificationEnabled: true,
        students: [
          {
            id: 1,
            name: 'Alice',
            email: 'a@x.com',
            externalId: null,
            level: 7,
            totalXp: 999,
          },
        ],
      });
      const thead = document.querySelector('thead')!;
      expect(
        within(thead as HTMLElement).getByText('Level'),
      ).toBeInTheDocument();
      expect(
        within(thead as HTMLElement).getByText('Total XP'),
      ).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('does not render Level/Total XP even if storage enables them when gamification is off', () => {
      localStorage.setItem(
        WEIGHTED_STORAGE_KEY,
        JSON.stringify({ level: true, totalXp: true }),
      );
      renderWeighted({ gamificationEnabled: false });
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
          within(thead as HTMLElement).getByText('External ID'),
        ).toBeInTheDocument();
        expect(screen.getByText('EXT-001')).toBeInTheDocument();
      });

      it('hides External ID column by default when no student has one', async () => {
        renderWeighted();
        await screen.findByText('Alice');
        expect(screen.queryByText('External ID')).not.toBeInTheDocument();
      });

      it('treats a blank external ID as absent and hides the column by default', async () => {
        renderWeighted({
          students: [{ ...makeStudent(1, 'Alice'), externalId: '' }],
        });
        await screen.findByText('Alice');
        expect(screen.queryByText('External ID')).not.toBeInTheDocument();
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
          within(thead as HTMLElement).getByText('External ID'),
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
});
