import userEvent from '@testing-library/user-event';
import { store as appStore } from 'store';
import { render, screen, waitFor, within } from 'test-utils';

import GradebookTable from '../components/GradebookTable';
import type {
  AssessmentData,
  CategoryData,
  StudentData,
  SubmissionData,
  TabData,
} from '../types';

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
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    externalId: null,
    level: 5,
    totalXp: 300,
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
}

const renderTable = ({
  gamificationEnabled = true,
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
      screen.getByRole('button', { name: /select columns/i }),
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
        name: /select columns/i,
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

  describe('external ID column', () => {
    const studentsWithExtId: StudentData[] = [
      {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        externalId: 'EXT-001',
        level: 3,
        totalXp: 150,
      },
      {
        id: 2,
        name: 'Bob',
        email: 'bob@example.com',
        externalId: null,
        level: 5,
        totalXp: 300,
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
        name: /select columns/i,
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
        />,
        { state: userState },
      );
      await screen.findByText('Alice');
      await user.click(screen.getByRole('button', { name: /quiz 1/i })); // sort by grade asc
      await user.click(screen.getByRole('button', { name: /quiz 1/i })); // → desc
      await waitFor(() => expectInOrder(['Alice', 'Bob'])); // Alice has grade 8, Bob has none

      // Hide Quiz 1 via the column picker.
      await user.click(screen.getByRole('button', { name: /select columns/i }));
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
        />,
        { state: userState },
      );
      await screen.findByText('Alice');
      await user.click(screen.getByRole('button', { name: /quiz 1/i })); // asc
      await user.click(screen.getByRole('button', { name: /quiz 1/i })); // desc

      await user.click(screen.getByRole('button', { name: /select columns/i }));
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
});
