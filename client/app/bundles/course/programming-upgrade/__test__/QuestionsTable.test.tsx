import userEvent from '@testing-library/user-event';
import { render, waitFor, within } from 'test-utils';
import {
  ProgrammingLanguageData,
  ProgrammingUpgradeListData,
  ProgrammingUpgradeQuestionData,
} from 'types/course/programmingUpgrade';

import QuestionsTable from '../QuestionsTable';

const PY37: ProgrammingLanguageData = {
  id: 8,
  name: 'Python 3.7',
  deprecated: true,
};
const PY39: ProgrammingLanguageData = {
  id: 552,
  name: 'Python 3.9',
  deprecated: false,
};
const PY314: ProgrammingLanguageData = {
  id: 567,
  name: 'Python 3.14',
  deprecated: false,
};

const question = (
  overrides: Partial<ProgrammingUpgradeQuestionData> = {},
): ProgrammingUpgradeQuestionData => ({
  id: 1,
  title: 'Question 1: Recursion',
  editUrl: '/courses/1/assessments/1/question/programming/1/edit',
  assessment: { id: 1, title: 'Lab 1', url: '/courses/1/assessments/1' },
  submissionCount: 0,
  languageId: PY39.id,
  upgradeTargetIds: [PY314.id, PY39.id],
  upgradable: true,
  ...overrides,
});

const listData = (
  questions: ProgrammingUpgradeQuestionData[],
): ProgrammingUpgradeListData => ({
  questions,
  languages: [PY37, PY39, PY314],
  rowCount: questions.length,
});

const rows: ProgrammingUpgradeQuestionData[] = [
  question(),
  question({
    id: 2,
    title: 'Question 1: Loops',
    assessment: { id: 2, title: 'Lab 2', url: '/courses/1/assessments/2' },
    languageId: PY37.id,
    upgradeTargetIds: [PY314.id, PY39.id],
  }),
  question({
    id: 3,
    title: 'Question 2: Already current',
    languageId: PY314.id,
    upgradeTargetIds: [PY314.id],
    upgradable: false,
  }),
];

jest.mock('../operations', () => ({
  fetchQuestions: jest.fn(),
  fetchUpgrades: jest.fn(),
  upgradeQuestions: jest.fn(),
  revertQuestion: jest.fn(),
}));

const operations = jest.requireMock('../operations');

// Column headers are matched by REGEX, never by an exact string: a filterable column's header cell
// also contains the filter IconButton, whose tooltip contributes "Filter" to the cell's accessible
// name (MUI applies the tooltip title as `aria-label` on a child with no text of its own).
describe('<QuestionsTable />', () => {
  beforeEach(() => {
    operations.fetchQuestions.mockResolvedValue(listData(rows));
  });

  /**
   * A column only offers filter options if it has its own accessor. Without `of` or `accessorFn`,
   * columnsBuilder leaves `accessorKey` undefined, faceting finds no values, and the menu comes up
   * empty — which is exactly how Assessment and Status first shipped.
   */
  const openFilterFor = async (
    page: ReturnType<typeof render>,
    header: RegExp,
  ): Promise<void> => {
    const user = userEvent.setup();
    const columnHeader = await page.findByRole('columnheader', {
      name: header,
    });

    await user.click(
      within(columnHeader).getByRole('button', { name: 'Filter' }),
    );
  };

  it('offers the assessment titles as filter options', async () => {
    const page = render(<QuestionsTable />);
    await openFilterFor(page, /Assessment/);

    expect(await page.findByRole('menuitem', { name: 'Lab 1' })).toBeVisible();
    expect(page.getByRole('menuitem', { name: 'Lab 2' })).toBeVisible();
  });

  it('offers the languages as filter options', async () => {
    const page = render(<QuestionsTable />);
    await openFilterFor(page, /Language/);

    expect(
      await page.findByRole('menuitem', { name: 'Python 3.9' }),
    ).toBeVisible();
    expect(page.getByRole('menuitem', { name: 'Python 3.7' })).toBeVisible();
  });

  // Deprecated and Upgradable are language-derived; a row already on the newest version has no
  // status at all and must contribute no option.
  it('offers the statuses as filter options', async () => {
    const page = render(<QuestionsTable />);
    await openFilterFor(page, /Status/);

    expect(
      await page.findByRole('menuitem', { name: 'Deprecated' }),
    ).toBeVisible();
    expect(page.getByRole('menuitem', { name: 'Upgradable' })).toBeVisible();
  });

  it('filters the rows down when a status is picked', async () => {
    const user = userEvent.setup();
    const page = render(<QuestionsTable />);

    await openFilterFor(page, /Status/);
    await user.click(await page.findByRole('menuitem', { name: 'Deprecated' }));

    // An open MUI menu marks the rest of the page `aria-hidden`, so the rows are unqueryable until
    // it is closed.
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument(),
    );

    expect(page.getByText('Question 1: Loops')).toBeInTheDocument();
    expect(page.queryByText('Question 1: Recursion')).not.toBeInTheDocument();
  });
});
