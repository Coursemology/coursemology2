import { IntlProvider } from 'react-intl';
import { fireEvent, render, screen } from '@testing-library/react';

import { buildAssessmentColumnId } from '../components/buildAssessmentColumnIds';
import GradebookColumnTree from '../components/GradebookColumnTree';
import type { AssessmentData, CategoryData, TabData } from '../types';

const categories: CategoryData[] = [{ id: 1, title: 'Cat A' }];
const tabs: TabData[] = [{ id: 10, title: 'Tab 1', categoryId: 1 }];
const assessments: AssessmentData[] = [
  { id: 100, title: 'Quiz 1', tabId: 10, maxGrade: 10 },
  { id: 101, title: 'Quiz 2', tabId: 10, maxGrade: 10 },
];

const asnId100 = buildAssessmentColumnId(100);
const asnId101 = buildAssessmentColumnId(101);
const allIds = ['name', 'email', 'externalId', 'level', asnId100, asnId101];

const wrap = (node: JSX.Element): JSX.Element => (
  <IntlProvider defaultLocale="en" locale="en">
    {node}
  </IntlProvider>
);

describe('GradebookColumnTree', () => {
  it('renders Student info and Grades branch labels', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(screen.getByText('Student info')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
  });

  it('renders Gamification branch when gamificationEnabled', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(screen.getByText('Gamification')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /^level$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /^total xp$/i }),
    ).toBeInTheDocument();
  });

  it('hides Gamification branch when gamificationEnabled is false', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled={false}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(screen.queryByText('Gamification')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: /^level$/i }),
    ).not.toBeInTheDocument();
  });

  it('renders an External ID checkbox in the Student info group', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled={false}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(
      screen.getByRole('checkbox', { name: /external id/i }),
    ).toBeInTheDocument();
  });

  it('clicking the External ID checkbox calls setVisible with its column id', () => {
    const setVisible = jest.fn();
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled={false}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={setVisible}
          tabs={tabs}
        />,
      ),
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /external id/i }));
    expect(setVisible).toHaveBeenCalledWith('externalId', expect.any(Boolean));
  });

  it('name checkbox is disabled and always checked', () => {
    const visibility: Record<string, boolean> = {
      name: false,
      email: true,
      [asnId100]: true,
      [asnId101]: true,
    };
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled={false}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    const nameCheckbox = screen.getByRole('checkbox', { name: /^name/i });
    expect(nameCheckbox).toBeDisabled();
    expect(nameCheckbox).toBeChecked();
  });

  it('non-name student info checkboxes are enabled and reflect visibility state', () => {
    const visibility: Record<string, boolean> = {
      name: true,
      email: false,
      [asnId100]: true,
      [asnId101]: true,
    };
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled={false}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    const emailCheckbox = screen.getByRole('checkbox', { name: /^email$/i });
    expect(emailCheckbox).not.toBeDisabled();
    expect(emailCheckbox).not.toBeChecked();
  });

  it('clicking a student info checkbox calls setVisible with its column id', () => {
    const setVisible = jest.fn();
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={setVisible}
          tabs={tabs}
        />,
      ),
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /^email$/i }));
    expect(setVisible).toHaveBeenCalledWith('email', expect.any(Boolean));
  });

  it('renders Category, Tab, and assessment checkboxes', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(screen.getByText('Cat A')).toBeInTheDocument();
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /quiz 1/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /quiz 2/i }),
    ).toBeInTheDocument();
  });

  it('clicking an assessment checkbox calls setVisible with the single column id', () => {
    const setVisible = jest.fn();
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={setVisible}
          tabs={tabs}
        />,
      ),
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /quiz 1/i }));
    expect(setVisible).toHaveBeenCalledWith(asnId100, expect.any(Boolean));
  });

  it('renders "Always included" chip next to the Name row', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled={false}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(screen.getByText('Always included')).toBeInTheDocument();
  });

  it('does not render "Always included" chip next to email row', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled={false}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(screen.getAllByText('Always included')).toHaveLength(1);
  });

  it('Student info branch is indeterminate when some but not all student cols are visible', () => {
    const visibility: Record<string, boolean> = {
      name: true,
      email: false,
      [asnId100]: true,
      [asnId101]: true,
    };
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          gamificationEnabled={false}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(
      screen.getByRole('checkbox', { name: /student info/i }),
    ).toHaveAttribute('data-indeterminate', 'true');
  });
});
