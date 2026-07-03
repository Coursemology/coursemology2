import userEvent from '@testing-library/user-event';
import { store as appStore } from 'store';
import { render, screen, waitFor, within } from 'test-utils';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';

import GradebookTable, {
  EXTERNAL_ASSESSMENT_BACKGROUND,
} from '../components/GradebookTable';
import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from '../types';

jest.mock('api/course');

jest.mock('lib/hooks/toast', () => ({
  __esModule: true,
  default: { error: jest.fn(), success: jest.fn() },
}));

const categories: CategoryData[] = [{ id: 1, title: 'Cat A' }];
const tabs: TabData[] = [{ id: 10, title: 'Tab 1', categoryId: 1 }];
const assessments: AssessmentData[] = [
  { id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 },
];
const students: StudentData[] = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    externalId: null,
    level: 3,
    totalXp: 150,
    levelContribution: null,
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    externalId: null,
    level: 5,
    totalXp: 300,
    levelContribution: null,
  },
];
const submissions: SubmissionData[] = [
  { submissionId: 0, studentId: 1, assessmentId: 100, grade: 8 },
];

const makeStudents = (n: number): StudentData[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Student ${i + 1}`,
    email: `student${i + 1}@example.com`,
    externalId: null,
    level: 1,
    totalXp: 0,
    levelContribution: null,
  }));

// Asserts the given texts appear in this top-to-bottom DOM order.
const expectInOrder = (names: string[]): void => {
  for (let i = 0; i < names.length - 1; i += 1) {
    const earlier = screen.getByText(names[i]);
    const later = screen.getByText(names[i + 1]);
    expect(
      // eslint-disable-next-line no-bitwise
      earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  }
};

// User id used in all renders so localStorage is keyed as `${USER_ID}:gradebook_columns_1`.
// It is seeded into the global user store, which the course layout loader hydrates
// on every course page; the builder namespaces column persistence by that id.
const USER_ID = 42;
const STORAGE_KEY = `${USER_ID}:gradebook_columns_1`;
const SORT_STORAGE_KEY = `${STORAGE_KEY}_sort`;

const userState = {
  global: {
    ...appStore.getState().global,
    user: {
      ...appStore.getState().global.user,
      user: { id: USER_ID, name: '', imageUrl: '' },
    },
  },
};

interface RenderOptions {
  gamificationEnabled?: boolean;
  weightedViewEnabled?: boolean;
}

const renderTable = ({
  gamificationEnabled = true,
  weightedViewEnabled = false,
}: RenderOptions = {}): void => {
  render(
    <GradebookTable
      assessments={assessments}
      categories={categories}
      courseId={1}
      courseTitle="Test Course"
      gamificationEnabled={gamificationEnabled}
      students={students}
      submissions={submissions}
      tabs={tabs}
      weightedViewEnabled={weightedViewEnabled}
    />,
    { state: userState },
  );
};

const renderTableWithAssessmentVisible = (
  options: RenderOptions = {},
): void => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      name: true,
      email: true,
      'asn-100': true,
    }),
  );
  renderTable(options);
};

describe('GradebookTable', () => {
  beforeEach(() => localStorage.clear());

  it('renders both student names', async () => {
    renderTableWithAssessmentVisible();
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();
  });

  it('renders two header rows (column titles and max marks)', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: true,
        email: true,

        'asn-100': true,
      }),
    );
    const { container } = render(
      <GradebookTable
        assessments={assessments}
        categories={categories}
        courseId={1}
        courseTitle="Test Course"
        gamificationEnabled
        students={students}
        submissions={submissions}
        tabs={tabs}
        weightedViewEnabled={false}
      />,
      { state: userState },
    );
    await screen.findByText('Alice');
    expect(container.querySelectorAll('thead tr')).toHaveLength(2);
  });

  it('shows Select Columns button and Export button', async () => {
    renderTableWithAssessmentVisible();
    await screen.findByText('Alice');
    expect(
      screen.getByRole('button', { name: /columns/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });

  describe('export button label reflects selection', () => {
    it('shows "Export all rows" when no rows are selected', async () => {
      renderTableWithAssessmentVisible();
      await screen.findByText('Alice');
      expect(
        screen.getByRole('button', { name: /export all rows/i }),
      ).toBeInTheDocument();
    });

    it('shows tooltip "all rows will be exported" when no rows are selected', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      const exportBtn = await screen.findByRole('button', {
        name: /export all rows/i,
      });
      await user.hover(exportBtn);
      expect(
        await screen.findByText(/all rows will be exported/i),
      ).toBeInTheDocument();
    });

    it('hides the tooltip when a row is selected', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[1]);
      const exportBtn = await screen.findByRole('button', {
        name: /export 1 row/i,
      });
      await user.hover(exportBtn);
      expect(
        screen.queryByText(/all rows will be exported/i),
      ).not.toBeInTheDocument();
    });

    it('shows "Export 1 row" when one row is selected', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /export 1 row/i }),
        ).toBeInTheDocument(),
      );
    });

    it('shows "Export all rows" when all rows are selected via the corner checkbox', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /export all rows/i }),
        ).toBeInTheDocument(),
      );
      expect(
        screen.queryByRole('button', { name: /export \d+ row/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('shows the Max Marks header row', async () => {
    renderTableWithAssessmentVisible();
    expect(await screen.findByText('Max Marks')).toBeInTheDocument();
  });

  it('leaves the Max Marks cell blank under non-assessment columns', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ name: true, email: true, 'asn-100': true }),
    );
    renderTable();
    await screen.findByText('Max Marks');
    // The Max Marks (second header) row has a "/10" under Quiz 1 and the
    // "Max Marks" label under name, but the email column's cell is empty.
    // The Max Marks row lives in the TableHead, so its cells are <th>
    // (role columnheader), not <td>/cell.
    const maxMarksCell = screen.getByText('Max Marks').closest('th')!;
    const maxMarksRow = maxMarksCell.closest('tr')!;
    const cells = within(maxMarksRow as HTMLElement).getAllByRole(
      'columnheader',
    );
    // checkbox spacer | name("Max Marks") | email("") | asn-100("/10")
    expect(cells[2]).toHaveTextContent('');
  });

  it('hides the Max Marks header row when all assessment columns are deselected', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'asn-100': false }));
    renderTable();
    await screen.findByText('Alice');
    expect(screen.queryByText('Max Marks')).not.toBeInTheDocument();
  });

  it('renders row selection checkboxes', async () => {
    renderTableWithAssessmentVisible();
    await screen.findByText('Alice');
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThanOrEqual(2);
  });

  describe('row selection', () => {
    it('keeps search input visible after selecting a row', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[1]);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('keeps Export button visible after selecting a row', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[1]);
      expect(
        screen.getByRole('button', { name: /export/i }),
      ).toBeInTheDocument();
    });
  });

  it('does not show assessment columns in the table by default', async () => {
    renderTable();
    await screen.findByText('Alice');
    expect(screen.queryByText('Quiz 1')).not.toBeInTheDocument();
  });

  it('shows gamification columns by default when gamification is enabled', async () => {
    renderTable({ gamificationEnabled: true });
    expect(await screen.findByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Total XP')).toBeInTheDocument();
  });

  describe('gamification columns', () => {
    it('shows level and totalXp in the column picker when gamification is enabled', async () => {
      const user = userEvent.setup();
      renderTable({ gamificationEnabled: true });
      const selectColumnsBtn = await screen.findByRole('button', {
        name: /columns/i,
      });
      await user.click(selectColumnsBtn);
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Level')).toBeInTheDocument();
      expect(within(dialog).getByText('Total XP')).toBeInTheDocument();
    });
  });

  describe('locked name column', () => {
    it('name is always visible even when localStorage sets it to false', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name: false,
          email: true,

          'asn-100': true,
        }),
      );
      renderTable();
      await waitFor(() =>
        expect(screen.getByText('Alice')).toBeInTheDocument(),
      );
    });
  });

  describe('gamification disabled', () => {
    it('level and totalXp absent from table headers when gamification is disabled', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name: true,
          email: true,

          level: true,
          totalXp: true,
          'asn-100': true,
        }),
      );
      renderTable({ gamificationEnabled: false });
      await screen.findByText('Alice');
      expect(screen.queryByText('Level')).not.toBeInTheDocument();
      expect(screen.queryByText('Total XP')).not.toBeInTheDocument();
    });
  });

  it('shows the table when gamification columns are visible and assessments are deselected', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'asn-100': false }));
    renderTable({ gamificationEnabled: true });
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('export button is always enabled regardless of which columns are selected', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'asn-100': false }));
    renderTable({ gamificationEnabled: false });
    await screen.findByText('Alice');
    expect(screen.getByRole('button', { name: /export/i })).not.toBeDisabled();
  });

  it('shows the table (not an empty state) when all assessments are deselected', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'asn-100': false }));
    renderTable({ gamificationEnabled: false });
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(await screen.findByText('Alice')).toBeInTheDocument();
  });

  it('shows the table when all optional columns are deselected with gamification', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ 'asn-100': false, level: false, totalXp: false }),
    );
    renderTable({ gamificationEnabled: true });
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(await screen.findByText('Alice')).toBeInTheDocument();
  });

  it('shows pagination when all assessments are deselected', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'asn-100': false }));
    renderTable({ gamificationEnabled: false });
    await screen.findByText('Alice');
    expect(screen.getByText(/rows per page/i)).toBeInTheDocument();
  });

  it('shows the table with assessment columns when restored from localStorage', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: true,
        email: true,

        'asn-100': true,
      }),
    );
    renderTable();
    expect(await screen.findByText('Quiz 1')).toBeInTheDocument();
  });

  // An assessment selected (and persisted) earlier may be deleted before the next
  // visit, leaving a stale column id in localStorage. The table must ignore it
  // rather than crash, and still render the surviving assessment columns.
  it('does not crash when localStorage references a deleted assessment', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: true,
        email: true,
        'asn-100': true,
        'asn-999': true,
      }),
    );
    renderTable();
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    // The surviving assessment still renders; the deleted one is silently dropped.
    expect(screen.getByText('Quiz 1')).toBeInTheDocument();
  });

  describe('search', () => {
    it('filters by name', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      const input = await screen.findByRole('textbox');
      await user.type(input, 'Alice');
      await waitFor(() =>
        expect(screen.queryByText('Bob')).not.toBeInTheDocument(),
      );
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('filters by email', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      const input = await screen.findByRole('textbox');
      await user.type(input, 'bob@example.com');
      await waitFor(() =>
        expect(screen.queryByText('Alice')).not.toBeInTheDocument(),
      );
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });
  });

  describe('no-data-columns hint', () => {
    it('warns that export is student-info-only, mentioning gamification, when gamification is on', async () => {
      const user = userEvent.setup();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ 'asn-100': false, level: false, totalXp: false }),
      );
      renderTable({ gamificationEnabled: true });
      await screen.findByText('Alice');
      await user.click(screen.getByRole('button', { name: /columns/i }));
      expect(
        await screen.findByText(/no grade or gamification columns selected/i),
      ).toBeInTheDocument();
    });

    it('warns that export is student-info-only, no gamification mention, when gamification is off', async () => {
      const user = userEvent.setup();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ 'asn-100': false }));
      renderTable({ gamificationEnabled: false });
      await screen.findByText('Alice');
      await user.click(screen.getByRole('button', { name: /columns/i }));
      expect(
        await screen.findByText(/no grade columns selected/i),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/gamification columns selected/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('external ID column', () => {
    const studentsWithExtId: StudentData[] = [
      {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        externalId: 'EXT-001',
        level: 3,
        totalXp: 150,
        levelContribution: null,
      },
      {
        id: 2,
        name: 'Bob',
        email: 'bob@example.com',
        externalId: null,
        level: 5,
        totalXp: 300,
        levelContribution: null,
      },
    ];

    const renderWith = (studs: StudentData[]): void => {
      render(
        <GradebookTable
          assessments={assessments}
          categories={categories}
          courseId={1}
          courseTitle="Test Course"
          gamificationEnabled
          students={studs}
          submissions={[]}
          tabs={tabs}
          weightedViewEnabled={false}
        />,
        { state: userState },
      );
    };

    it('shows the External ID column by default when a student has an external ID', async () => {
      renderWith(studentsWithExtId);
      expect(await screen.findByText('External ID')).toBeInTheDocument();
      expect(screen.getByText('EXT-001')).toBeInTheDocument();
    });

    it('hides the External ID column by default when no student has an external ID', async () => {
      renderWith(students);
      await screen.findByText('Alice');
      expect(screen.queryByText('External ID')).not.toBeInTheDocument();
    });

    it('treats a blank external ID as none and hides the column by default', async () => {
      const studentsWithBlankExtId: StudentData[] = [
        {
          id: 1,
          name: 'Alice',
          email: 'alice@example.com',
          externalId: '',
          level: 3,
          totalXp: 150,
          levelContribution: null,
        },
      ];
      renderWith(studentsWithBlankExtId);
      await screen.findByText('Alice');
      expect(screen.queryByText('External ID')).not.toBeInTheDocument();
    });

    it('offers the External ID checkbox in the picker even when no student has one', async () => {
      const user = userEvent.setup();
      renderWith(students);
      const btn = await screen.findByRole('button', {
        name: /columns/i,
      });
      await user.click(btn);
      const dialog = await screen.findByRole('dialog');
      expect(
        within(dialog).getByRole('checkbox', { name: /external id/i }),
      ).toBeInTheDocument();
    });

    it('filters by external ID', async () => {
      const user = userEvent.setup();
      renderWith(studentsWithExtId);
      const input = await screen.findByRole('textbox');
      await user.type(input, 'EXT-001');
      await waitFor(() =>
        expect(screen.queryByText('Bob')).not.toBeInTheDocument(),
      );
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('defaults to sorting by name ascending on first load', async () => {
      // Raw prop order is Bob, then Alice. A working default name-asc sort must
      // reorder the rendered rows to Alice, then Bob.
      render(
        <GradebookTable
          assessments={assessments}
          categories={categories}
          courseId={1}
          courseTitle="Test Course"
          gamificationEnabled
          students={[students[1], students[0]]}
          submissions={submissions}
          tabs={tabs}
          weightedViewEnabled={false}
        />,
        { state: userState },
      );
      await screen.findByText('Alice');
      expectInOrder(['Alice', 'Bob']);
    });

    it('cycles back to ascending on a third click (sort is never cleared)', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      await screen.findByText('Alice');
      await user.click(screen.getByRole('button', { name: /name/i })); // → desc
      await waitFor(() => expectInOrder(['Bob', 'Alice']));
      await user.click(screen.getByRole('button', { name: /name/i })); // → asc again
      await waitFor(() => expectInOrder(['Alice', 'Bob']));
    });

    it('toggles to descending when the name header is clicked', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      await screen.findByText('Alice');
      expectInOrder(['Alice', 'Bob']); // default ascending
      await user.click(screen.getByRole('button', { name: /name/i }));
      await waitFor(() => expectInOrder(['Bob', 'Alice']));
    });

    it('preserves the active sort after searching', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      await screen.findByText('Alice');
      // Switch to descending so the order is distinct from both raw and default.
      await user.click(screen.getByRole('button', { name: /name/i }));
      await waitFor(() => expectInOrder(['Bob', 'Alice']));
      // A search matching both students must not reset the descending sort.
      await user.type(screen.getByRole('textbox'), 'example.com');
      await waitFor(() =>
        expect(screen.getByText('Alice')).toBeInTheDocument(),
      );
      expectInOrder(['Bob', 'Alice']);
    });

    it('resets to name ascending when the sorted column is hidden', async () => {
      const user = userEvent.setup();
      // Start with Quiz 1 visible and sort by it descending.
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: true, 'asn-100': true }),
      );
      render(
        <GradebookTable
          assessments={assessments}
          categories={categories}
          courseId={1}
          courseTitle="Test Course"
          gamificationEnabled
          students={[students[1], students[0]]} // Bob first in raw order
          submissions={submissions}
          tabs={tabs}
          weightedViewEnabled={false}
        />,
        { state: userState },
      );
      await screen.findByText('Alice');
      await user.click(screen.getByRole('button', { name: /quiz 1/i })); // sort by grade asc
      await user.click(screen.getByRole('button', { name: /quiz 1/i })); // → desc
      await waitFor(() => expectInOrder(['Alice', 'Bob'])); // Alice has grade 8, Bob has none

      // Hide Quiz 1 via the column picker.
      await user.click(screen.getByRole('button', { name: /columns/i }));
      const dialog = await screen.findByRole('dialog');
      await user.click(
        within(dialog).getByRole('checkbox', { name: /quiz 1/i }),
      );
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // Sort should reset to name ascending: Alice before Bob.
      await waitFor(() => expectInOrder(['Alice', 'Bob']));
    });

    it('saves the sort to localStorage when the user clicks a column header', async () => {
      const user = userEvent.setup();
      renderTableWithAssessmentVisible();
      await screen.findByText('Alice');
      await user.click(screen.getByRole('button', { name: /name/i })); // → desc
      await waitFor(() => expectInOrder(['Bob', 'Alice']));
      expect(
        JSON.parse(localStorage.getItem(SORT_STORAGE_KEY) ?? 'null'),
      ).toEqual([{ id: 'name', desc: true }]);
    });

    it('restores sort from localStorage on re-mount', async () => {
      // Pre-seed descending name sort so the table should render Bob before Alice.
      localStorage.setItem(
        SORT_STORAGE_KEY,
        JSON.stringify([{ id: 'name', desc: true }]),
      );
      renderTableWithAssessmentVisible();
      await screen.findByText('Alice');
      expectInOrder(['Bob', 'Alice']);
    });

    it('persists the name-ascending reset to localStorage when a sorted column is hidden', async () => {
      const user = userEvent.setup();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: true, 'asn-100': true }),
      );
      render(
        <GradebookTable
          assessments={assessments}
          categories={categories}
          courseId={1}
          courseTitle="Test Course"
          gamificationEnabled
          students={[students[1], students[0]]}
          submissions={submissions}
          tabs={tabs}
          weightedViewEnabled={false}
        />,
        { state: userState },
      );
      await screen.findByText('Alice');
      await user.click(screen.getByRole('button', { name: /quiz 1/i })); // asc
      await user.click(screen.getByRole('button', { name: /quiz 1/i })); // desc

      await user.click(screen.getByRole('button', { name: /columns/i }));
      const dialog = await screen.findByRole('dialog');
      await user.click(
        within(dialog).getByRole('checkbox', { name: /quiz 1/i }),
      );
      await user.click(screen.getByRole('button', { name: /apply/i }));

      await waitFor(() => expectInOrder(['Alice', 'Bob']));
      expect(
        JSON.parse(localStorage.getItem(SORT_STORAGE_KEY) ?? 'null'),
      ).toEqual([{ id: 'name', desc: false }]);
    });

    describe('assessment grade sorting', () => {
      const studentFor = (id: number, name: string): StudentData => ({
        id,
        name,
        email: `${name.toLowerCase()}@example.com`,
        externalId: null,
        level: 1,
        totalXp: 0,
        levelContribution: null,
      });

      const renderGrades = (
        studs: StudentData[],
        subs: SubmissionData[],
      ): void => {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name: true, 'asn-100': true }),
        );
        render(
          <GradebookTable
            assessments={assessments}
            categories={categories}
            courseId={1}
            courseTitle="Test Course"
            gamificationEnabled
            students={studs}
            submissions={subs}
            tabs={tabs}
            weightedViewEnabled={false}
          />,
          { state: userState },
        );
      };

      // Alice graded 8, Bob graded 3, Carol no submission (undefined),
      // Dave submitted but ungraded (null).
      const mixedStudents: StudentData[] = [
        studentFor(1, 'Alice'),
        studentFor(2, 'Bob'),
        studentFor(3, 'Carol'),
        studentFor(4, 'Dave'),
      ];
      const mixedSubmissions: SubmissionData[] = [
        { submissionId: 1, studentId: 1, assessmentId: 100, grade: 8 },
        { submissionId: 2, studentId: 2, assessmentId: 100, grade: 3 },
        { submissionId: 4, studentId: 4, assessmentId: 100, grade: null },
      ];

      it('sorts missing grades to the bottom in ascending order', async () => {
        const user = userEvent.setup();
        renderGrades(mixedStudents, mixedSubmissions);
        await screen.findByText('Alice');
        await user.click(screen.getByRole('button', { name: /quiz 1/i }));
        // Ascending: Bob(3), Alice(8), then the two missing rows last.
        await waitFor(() => expectInOrder(['Bob', 'Alice']));
        expectInOrder(['Alice', 'Carol']);
        expectInOrder(['Alice', 'Dave']);
      });

      it('keeps missing grades at the bottom in descending order', async () => {
        const user = userEvent.setup();
        renderGrades(mixedStudents, mixedSubmissions);
        await screen.findByText('Alice');
        await user.click(screen.getByRole('button', { name: /quiz 1/i })); // asc
        await user.click(screen.getByRole('button', { name: /quiz 1/i })); // desc
        // Descending: Alice(8), Bob(3), then the two missing rows still last.
        await waitFor(() => expectInOrder(['Alice', 'Bob']));
        expectInOrder(['Bob', 'Carol']);
        expectInOrder(['Bob', 'Dave']);
      });

      it('sorts grades numerically (9 before 10), not lexically', async () => {
        const user = userEvent.setup();
        renderGrades(
          [studentFor(1, 'Alice'), studentFor(2, 'Bob')],
          [
            { submissionId: 1, studentId: 1, assessmentId: 100, grade: 9 },
            { submissionId: 2, studentId: 2, assessmentId: 100, grade: 10 },
          ],
        );
        await screen.findByText('Alice');
        await user.click(screen.getByRole('button', { name: /quiz 1/i }));
        // Numeric ascending: 9 (Alice) before 10 (Bob). Lexical would reverse this.
        await waitFor(() => expectInOrder(['Alice', 'Bob']));
      });
    });
  });

  describe('assessment grade cell rendering', () => {
    const renderGradeCells = (subs: SubmissionData[]): void => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: true, 'asn-100': true }),
      );
      render(
        <GradebookTable
          assessments={assessments}
          categories={categories}
          courseId={1}
          courseTitle="Test Course"
          gamificationEnabled={false}
          students={students}
          submissions={subs}
          tabs={tabs}
          weightedViewEnabled={false}
        />,
        { state: userState },
      );
    };

    it('renders "—" when the student has no submission for an assessment', async () => {
      renderGradeCells([]);
      await screen.findByText('Alice');
      const aliceRow = screen.getByText('Alice').closest('tr')!;
      expect(
        within(aliceRow as HTMLElement).getByText('—'),
      ).toBeInTheDocument();
    });

    it('renders an empty cell (not "—") for a submission with a null grade', async () => {
      // Alice: submission with null grade → empty; Bob: no submission → '—'
      renderGradeCells([
        { submissionId: 1, studentId: 1, assessmentId: 100, grade: null },
      ]);
      await screen.findByText('Alice');
      const aliceRow = screen.getByText('Alice').closest('tr')!;
      expect(
        within(aliceRow as HTMLElement).queryByText('—'),
      ).not.toBeInTheDocument();
      const bobRow = screen.getByText('Bob').closest('tr')!;
      expect(within(bobRow as HTMLElement).getByText('—')).toBeInTheDocument();
    });

    it('renders the grade as a link to the submission when submissionId is present', async () => {
      renderGradeCells([
        { submissionId: 42, studentId: 1, assessmentId: 100, grade: 7 },
      ]);
      await screen.findByText('Alice');
      const aliceRow = screen.getByText('Alice').closest('tr')!;
      expect(
        within(aliceRow as HTMLElement).getByRole('link', { name: '7' }),
      ).toBeInTheDocument();
    });

    it('renders the grade as plain text (no link) when there is no submissionId', async () => {
      renderGradeCells([{ studentId: 1, assessmentId: 100, grade: 7 }]);
      await screen.findByText('Alice');
      const aliceRow = screen.getByText('Alice').closest('tr')!;
      expect(
        within(aliceRow as HTMLElement).getByText('7'),
      ).toBeInTheDocument();
      expect(
        within(aliceRow as HTMLElement).queryByRole('link', { name: '7' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('external assessment columns', () => {
    const externalAssessments: AssessmentData[] = [
      { id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 },
      { id: -5, title: 'Midterm', tabId: 200, maxGrade: 50, external: true },
    ];
    const externalTabs: TabData[] = [
      { id: 10, title: 'Tab 1', categoryId: 1 },
      { id: 200, title: 'Midterm', categoryId: 2 },
    ];
    const externalCategories: CategoryData[] = [
      { id: 1, title: 'Cat A' },
      { id: 2, title: 'External Assessments' },
    ];

    const renderWithExternal = (): void => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: true, 'asn--5': true, 'asn-100': true }),
      );
      render(
        <GradebookTable
          assessments={externalAssessments}
          categories={externalCategories}
          courseId={1}
          courseTitle="Course"
          gamificationEnabled={false}
          students={students}
          submissions={[{ studentId: 1, assessmentId: -5, grade: 30 }]}
          tabs={externalTabs}
          weightedViewEnabled={false}
        />,
        { state: userState },
      );
    };

    it('renders the External badge in the external column header', async () => {
      renderWithExternal();
      expect(await screen.findByText('External')).toBeVisible();
    });

    it('tints the external assessment body cells with the external background', async () => {
      renderWithExternal();
      const gradeCell = (await screen.findByText('30')).closest('td');
      expect(gradeCell).toHaveStyle({
        backgroundColor: EXTERNAL_ASSESSMENT_BACKGROUND,
      });
    });

    it('keeps the external column header the neutral grey (not the blue tint)', async () => {
      renderWithExternal();
      const headerCell = (await screen.findByText('Midterm')).closest('th');
      // grey[100] — the same opaque neutral every other header cell uses, so the
      // header reads as a header rather than a coloured band.
      expect(headerCell).toHaveStyle({ backgroundColor: 'rgb(245, 245, 245)' });
      expect(headerCell).not.toHaveStyle({
        backgroundColor: EXTERNAL_ASSESSMENT_BACKGROUND,
      });
    });

    it('edits an external grade inline and persists optimistically', async () => {
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockResolvedValue({
        data: { studentId: 1, assessmentId: -5, grade: 45 },
      });
      renderWithExternal();
      const cell = await screen.findByText('30');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterm grade for alice/i,
      });
      await userEvent.clear(input);
      await userEvent.type(input, '45');
      await userEvent.tab();
      await waitFor(() =>
        expect(CourseAPI.gradebook.setExternalGrade).toHaveBeenCalledWith(5, {
          studentId: 1,
          grade: 45,
        }),
      );
      expect(await screen.findByText('45')).toBeVisible();
    });

    it('rolls back the cell and keeps the old value when the API rejects', async () => {
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockRejectedValue(
        new Error('boom'),
      );
      renderWithExternal();
      const cell = await screen.findByText('30');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterm grade for alice/i,
      });
      await userEvent.clear(input);
      await userEvent.type(input, '45');
      await userEvent.tab();
      await waitFor(() => expect(screen.getByText('30')).toBeVisible());
    });

    it('names the student and assessment in the failure toast', async () => {
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockRejectedValue(
        new Error('boom'),
      );
      renderWithExternal();
      const cell = await screen.findByText('30');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterm grade for alice/i,
      });
      await userEvent.clear(input);
      await userEvent.type(input, '45');
      await userEvent.tab();
      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Midterm'),
        ),
      );
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Alice'),
      );
    });

    it('confirms a successful edit with a persistent toast showing the student, assessment, and old → new grade', async () => {
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockResolvedValue({
        data: { studentId: 1, assessmentId: -5, grade: 45 },
      });
      (toast.success as jest.Mock).mockClear();
      renderWithExternal();
      const cell = await screen.findByText('30');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterm grade for alice/i,
      });
      await userEvent.clear(input);
      await userEvent.type(input, '45');
      await userEvent.tab();
      await waitFor(() => expect(toast.success).toHaveBeenCalled());
      const [message, options] = (toast.success as jest.Mock).mock.calls[0];
      expect(message).toEqual(expect.stringContaining('Midterm'));
      expect(message).toEqual(expect.stringContaining('Alice'));
      expect(message).toEqual(expect.stringContaining('30'));
      expect(message).toEqual(expect.stringContaining('45'));
      // Persistent (no auto-dismiss). The toast is the only in-session record of
      // the overwritten value and exists to catch a row/column misclick, so it
      // must wait for the user's attention rather than expire on a timer.
      expect(options).toEqual(expect.objectContaining({ autoClose: false }));
    });

    it('does not toast a confirmation when the grade is unchanged', async () => {
      (toast.success as jest.Mock).mockClear();
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockClear();
      renderWithExternal();
      const cell = await screen.findByText('30');
      await userEvent.click(cell);
      screen.getByRole('textbox', { name: /midterm grade for alice/i });
      // Commit without changing the value.
      await userEvent.tab();
      expect(CourseAPI.gradebook.setExternalGrade).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
    });

    it('keeps regular assessment cells read-only (no input on click)', async () => {
      renderWithExternal();
      // Alice has no Quiz 1 submission → '—' is rendered (not an ExternalGradeCell).
      // Clicking the '—' in the Quiz 1 column must NOT produce a textbox.
      await screen.findByText('Midterm'); // wait for render
      const dashCells = screen.getAllByText('—');
      // The first '—' in Alice's row is the Quiz 1 cell (no submission).
      await userEvent.click(dashCells[0]);
      expect(
        screen.queryByRole('textbox', { name: /quiz 1/i }),
      ).not.toBeInTheDocument();
    });

    it('renders the external chip without a manage menu', async () => {
      renderWithExternal();
      expect(await screen.findByText('External')).toBeVisible();
      expect(
        screen.queryByRole('button', { name: /manage/i }),
      ).not.toBeInTheDocument();
    });

    it('shows an in-flight spinner while the grade save is pending', async () => {
      let resolveSave: () => void = () => {};
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveSave = (): void =>
            resolve({ data: { studentId: 1, assessmentId: -5, grade: 45 } });
        }),
      );
      renderWithExternal();
      const cell = await screen.findByText('30');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterm grade for alice/i,
      });
      await userEvent.clear(input);
      await userEvent.type(input, '45');
      await userEvent.tab();
      // Pending: spinner visible, optimistic value already shown.
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
      resolveSave();
      // Resolved: spinner gone, value remains.
      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(),
      );
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('caps an external grade at three integer digits (999.99 ceiling)', async () => {
      renderWithExternal();
      const cell = await screen.findByText('30');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterm grade for alice/i,
      });
      await userEvent.clear(input);
      // The fourth integer digit is dropped at entry — the DB column maxes at 999.99.
      await userEvent.type(input, '1000');
      expect(input).toHaveValue('100');
    });

    it('accepts up to two decimal places and rejects a third', async () => {
      renderWithExternal();
      const cell = await screen.findByText('30');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterm grade for alice/i,
      });
      await userEvent.clear(input);
      // A third decimal digit is rejected at entry — DB column is numeric(_, 2).
      await userEvent.type(input, '12.345');
      expect(input).toHaveValue('12.34');
    });

    it('does not call the API when the cell is committed without a change', async () => {
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockClear();
      renderWithExternal();
      const cell = await screen.findByText('30');
      await userEvent.click(cell);
      // Blur without editing → commit() sees an unchanged value and returns early.
      await userEvent.tab();
      await waitFor(() => expect(screen.getByText('30')).toBeVisible());
      expect(CourseAPI.gradebook.setExternalGrade).not.toHaveBeenCalled();
    });

    const renderCapped = (grade: number): void => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: true, 'asn--5': true }),
      );
      render(
        <GradebookTable
          assessments={[
            {
              id: -5,
              title: 'Midterm',
              tabId: 200,
              maxGrade: 50,
              external: true,
              capAtMaximum: true,
            },
          ]}
          categories={[{ id: 2, title: 'External Assessments' }]}
          courseId={1}
          courseTitle="Course"
          gamificationEnabled={false}
          students={students}
          submissions={[{ studentId: 1, assessmentId: -5, grade }]}
          tabs={[{ id: 200, title: 'Midterm', categoryId: 2 }]}
          weightedViewEnabled={false}
        />,
        { state: userState },
      );
    };

    it('flags a grade above the maximum on a capped assessment', async () => {
      renderCapped(60);
      expect(
        await screen.findByLabelText(/exceeds the maximum/i),
      ).toBeInTheDocument();
    });

    it('does not flag a grade within the maximum', async () => {
      renderCapped(40);
      await screen.findByText('40');
      expect(
        screen.queryByLabelText(/exceeds the maximum/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('ExternalGradeCell — negatives, buttons, tooltip copy', () => {
    // External assessments use negative IDs on the frontend; the operation
    // negates them before calling the API (so -(-901) = 901 is sent to the server).
    const EXT_ASN_ID = -901;
    const extAssessments: AssessmentData[] = [
      {
        id: EXT_ASN_ID,
        title: 'Midterms',
        tabId: 300,
        maxGrade: 100,
        external: true,
        floorAtZero: true,
        capAtMaximum: true,
      },
    ];
    const extTabs: TabData[] = [{ id: 300, title: 'Midterms', categoryId: 3 }];
    const extCategories: CategoryData[] = [
      { id: 3, title: 'External Assessments' },
    ];
    const aliceStudent: StudentData[] = [
      {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        externalId: null,
        level: 1,
        totalXp: 0,
        levelContribution: null,
      },
    ];

    beforeEach(() => {
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockClear();
    });

    const renderForExternal = ({
      grade = null,
      weightedViewEnabled = false,
    }: {
      grade?: number | null;
      weightedViewEnabled?: boolean;
    } = {}): ReturnType<typeof render> => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name: true, [`asn-${EXT_ASN_ID}`]: true }),
      );
      const subs =
        grade !== null
          ? [{ studentId: 1, assessmentId: EXT_ASN_ID, grade }]
          : [];
      return render(
        <GradebookTable
          assessments={extAssessments}
          categories={extCategories}
          courseId={1}
          courseTitle="Test Course"
          gamificationEnabled={false}
          students={aliceStudent}
          submissions={subs}
          tabs={extTabs}
          weightedViewEnabled={weightedViewEnabled}
        />,
        { state: userState },
      );
    };

    it('accepts a negative grade on entry and commits it', async () => {
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockResolvedValue({
        data: { studentId: 1, assessmentId: EXT_ASN_ID, grade: -5 },
      });
      renderForExternal({ grade: null });
      const cell = await screen.findByText('—');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterms grade for alice/i,
      });
      await userEvent.clear(input);
      await userEvent.type(input, '-5');
      await userEvent.keyboard('{Enter}');
      await waitFor(() =>
        expect(CourseAPI.gradebook.setExternalGrade).toHaveBeenCalledWith(
          -EXT_ASN_ID,
          { studentId: 1, grade: -5 },
        ),
      );
    });

    it('shows the below-zero icon when floored and grade < 0', async () => {
      renderForExternal({ grade: -5, weightedViewEnabled: true });
      await screen.findByText('-5');
      expect(screen.getByLabelText(/below 0/i)).toBeInTheDocument();
    });

    it('does not show the below-zero icon when the grade is non-negative', async () => {
      renderForExternal({ grade: 5, weightedViewEnabled: true });
      await screen.findByText('5');
      expect(screen.queryByLabelText(/below 0/i)).not.toBeInTheDocument();
    });

    it('revert button discards the edit without calling the API', async () => {
      renderForExternal({ grade: 10 });
      const cell = await screen.findByText('10');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterms grade for alice/i,
      });
      await userEvent.clear(input);
      await userEvent.type(input, '20');
      // userEvent.pointer is used instead of userEvent.click so that the
      // mousedown fires (and its preventDefault keeps input focus) before the
      // click, mirroring real-browser behaviour and preventing the onBlur=commit
      // from firing before the cancel handler runs.
      const revertBtn = screen.getByRole('button', { name: /revert/i });
      await userEvent.pointer({ target: revertBtn, keys: '[MouseLeft]' });
      expect(CourseAPI.gradebook.setExternalGrade).not.toHaveBeenCalled();
    });

    it('accept button commits the edit via the API', async () => {
      (CourseAPI.gradebook.setExternalGrade as jest.Mock).mockResolvedValue({
        data: { studentId: 1, assessmentId: EXT_ASN_ID, grade: 20 },
      });
      renderForExternal({ grade: 10 });
      const cell = await screen.findByText('10');
      await userEvent.click(cell);
      const input = screen.getByRole('textbox', {
        name: /midterms grade for alice/i,
      });
      await userEvent.clear(input);
      await userEvent.type(input, '20');
      const acceptBtn = screen.getByRole('button', { name: /accept/i });
      await userEvent.click(acceptBtn);
      await waitFor(() =>
        expect(CourseAPI.gradebook.setExternalGrade).toHaveBeenCalledWith(
          -EXT_ASN_ID,
          { studentId: 1, grade: 20 },
        ),
      );
    });

    it('over-max tooltip mentions the weighted total only when weighted view is on', async () => {
      // Weighted: tooltip should mention "weighted total"
      renderForExternal({ grade: 150, weightedViewEnabled: true });
      expect(
        await screen.findByLabelText(
          /contribution to the weighted total is capped/i,
        ),
      ).toBeInTheDocument();
    });

    it('over-max tooltip does not mention weighted total when weighted view is off', async () => {
      // Non-weighted: tooltip should just say "exceeds the maximum" without weighted mention
      renderForExternal({ grade: 150, weightedViewEnabled: false });
      expect(
        await screen.findByLabelText(/exceeds the maximum of 100/i),
      ).toBeInTheDocument();
      expect(
        screen.queryByLabelText(/weighted total/i),
      ).not.toBeInTheDocument();
    });

    it('below-zero tooltip mentions flooring in the weighted total when weighted view is on', async () => {
      renderForExternal({ grade: -5, weightedViewEnabled: true });
      expect(
        await screen.findByLabelText(/floored to 0 in the weighted total/i),
      ).toBeInTheDocument();
    });

    it('below-zero tooltip does not mention the weighted total when weighted view is off', async () => {
      renderForExternal({ grade: -5, weightedViewEnabled: false });
      expect(
        await screen.findByLabelText(/this grade is below 0\./i),
      ).toBeInTheDocument();
      expect(
        screen.queryByLabelText(/weighted total/i),
      ).not.toBeInTheDocument();
    });

    it('shows an edit affordance (pencil) on an external grade cell', async () => {
      renderForExternal({ grade: 30 });
      const value = await screen.findByText('30');
      const cell = value.closest('[role="button"]');
      expect(cell?.querySelector('[data-testid="edit-affordance"]')).not.toBeNull();
    });
  });

  describe('cross-page selection', () => {
    it('export label reflects selection count across pages', async () => {
      const user = userEvent.setup();
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name: true,
          email: true,

          'asn-100': true,
        }),
      );
      render(
        <GradebookTable
          assessments={assessments}
          categories={categories}
          courseId={1}
          courseTitle="Test Course"
          gamificationEnabled
          students={makeStudents(101)}
          submissions={[]}
          tabs={tabs}
          weightedViewEnabled={false}
        />,
        { state: userState },
      );

      const checkboxes = await screen.findAllByRole('checkbox');
      await user.click(checkboxes[1]);
      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /export 1 row/i }),
        ).toBeInTheDocument(),
      );

      // Default page size is DEFAULT_TABLE_ROWS_PER_PAGE (100), so 101 students
      // span two pages: Student 1 is on page 1, Student 101 alone on page 2.
      await user.click(
        screen.getByRole('button', { name: /go to next page/i }),
      );
      await waitFor(() =>
        expect(screen.getByText('Student 101')).toBeInTheDocument(),
      );
      expect(screen.queryByText('Student 1')).not.toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /export 1 row/i }),
      ).toBeInTheDocument();
    });
  });

  describe('external assessments', () => {
    it('shows external assessment columns by default but keeps native ones hidden', async () => {
      render(
        <GradebookTable
          assessments={[
            { id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 },
            {
              id: -200,
              title: 'Olympiad',
              tabId: -200,
              maxGrade: 100,
              external: true,
              floorAtZero: true,
              capAtMaximum: true,
            },
          ]}
          categories={categories}
          courseId={1}
          courseTitle="Test Course"
          gamificationEnabled={false}
          students={students}
          submissions={submissions}
          tabs={tabs}
          weightedViewEnabled={false}
        />,
        { state: userState },
      );
      expect(await screen.findByText('Olympiad')).toBeInTheDocument();
      expect(screen.queryByText('Quiz 1')).not.toBeInTheDocument();
    });
  });
});
