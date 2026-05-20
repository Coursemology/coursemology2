import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from 'test-utils';
import { store as appStore } from 'store';

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
    level: 3,
    totalXp: 150,
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    level: 5,
    totalXp: 300,
  },
];
const submissions: SubmissionData[] = [
  { studentId: 1, assessmentId: 100, grade: 8 },
];

const makeStudents = (n: number): StudentData[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `Student ${i + 1}`,
    email: `student${i + 1}@example.com`,
    level: 1,
    totalXp: 0,
  }));

// User id used in all renders so localStorage is keyed as `${USER_ID}:gradebook_columns_1`
const USER_ID = 42;
const STORAGE_KEY = `${USER_ID}:gradebook_columns_1`;

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
          students={makeStudents(11)}
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

      await user.click(
        screen.getByRole('button', { name: /go to next page/i }),
      );
      await waitFor(() =>
        expect(screen.getByText('Student 11')).toBeInTheDocument(),
      );
      expect(screen.queryByText('Student 1')).not.toBeInTheDocument();

      expect(
        screen.getByRole('button', { name: /export 1 row/i }),
      ).toBeInTheDocument();
    });
  });
});
