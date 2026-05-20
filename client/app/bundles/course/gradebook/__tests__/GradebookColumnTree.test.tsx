import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

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
  it('renders Student info and Assessments branch labels', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(screen.getByText('Student info')).toBeInTheDocument();
    expect(screen.getByText('Assessments')).toBeInTheDocument();
  });

  it('Name checkbox is disabled and checked', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    const nameCheckbox = screen.getByRole('checkbox', { name: /^name$/i });
    expect(nameCheckbox).toBeDisabled();
    expect(nameCheckbox).toBeChecked();
  });

  it('Level checkbox reflects visibility state', () => {
    const visibility: Record<string, boolean> = {
      ...Object.fromEntries(allIds.map((id) => [id, true])),
      level: false,
    };
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(screen.getByRole('checkbox', { name: /level/i })).not.toBeChecked();
  });

  it('renders Category, Tab, and assessment checkboxes', () => {
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
          isVisible={(id) => visibility[id] ?? true}
          setManyVisible={jest.fn()}
          setVisible={jest.fn()}
          tabs={tabs}
        />,
      ),
    );
    expect(screen.getByText('Cat A')).toBeInTheDocument();
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /quiz 1/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /quiz 2/i })).toBeInTheDocument();
  });

  it('clicking an assessment checkbox calls setVisible with the single column id', () => {
    const setVisible = jest.fn();
    const visibility = Object.fromEntries(allIds.map((id) => [id, true]));
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
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

  it('Student info branch is indeterminate when only Name is visible', () => {
    const visibility: Record<string, boolean> = {
      name: true,
      email: false,
      externalId: false,
      level: false,
      [asnId100]: true,
      [asnId101]: true,
    };
    render(
      wrap(
        <GradebookColumnTree
          assessments={assessments}
          categories={categories}
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
