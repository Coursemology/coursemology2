import { render, screen } from 'test-utils';

import ExternalGradeConflictTable from '../ExternalGradeConflictTable';

jest.mock('lib/components/wrappers/I18nProvider');

const rows = [
  {
    identifier: 'S1000',
    studentName: 'student1000',
    cells: {
      Midterm: { existing: 83.55, inFile: 90.05, changed: true },
    },
  },
];

it('renders a changed grade cell on a single line (no wrap)', () => {
  render(
    <ExternalGradeConflictTable
      componentNames={['Midterm']}
      identifierLabel="External ID"
      rows={rows}
    />,
  );

  const oldValue = screen.getByText('83.55');
  // the change cell (the <td> ancestor) must not wrap to two lines
  const cell = oldValue.closest('td') as HTMLElement;
  expect(cell).toHaveStyle({ whiteSpace: 'nowrap' });
});

it('renders a changed cell as struck old value, arrow, then bold new value', () => {
  render(
    <ExternalGradeConflictTable
      componentNames={['Midterm']}
      identifierLabel="External ID"
      rows={rows}
    />,
  );

  const oldValue = screen.getByText('83.55');
  expect(oldValue).toHaveStyle({ textDecoration: 'line-through' });

  const newValue = screen.getByText('90.05');
  expect(newValue).toHaveStyle({ fontWeight: 700 });

  // arrow separator sits between the two values, struck old before bold new
  const cellText = oldValue.closest('td')?.textContent ?? '';
  expect(cellText.indexOf('83.55')).toBeLessThan(cellText.indexOf('90.05'));
  expect(screen.getByTestId('ArrowForwardIcon')).toBeInTheDocument();
});

it('renders a new-fill cell (no existing) as a single plain value', () => {
  render(
    <ExternalGradeConflictTable
      componentNames={['Midterm']}
      identifierLabel="External ID"
      rows={[
        {
          identifier: 'S2000',
          studentName: 'student2000',
          cells: { Midterm: { existing: null, inFile: 77, changed: false } },
        },
      ]}
    />,
  );

  const value = screen.getByText('77');
  expect(value).not.toHaveStyle({ textDecoration: 'line-through' });
  expect(screen.queryByTestId('ArrowForwardIcon')).not.toBeInTheDocument();
});

it('falls back to the existing value when an unchanged cell has no inFile', () => {
  render(
    <ExternalGradeConflictTable
      componentNames={['Midterm']}
      identifierLabel="External ID"
      rows={[
        {
          identifier: 'S2001',
          studentName: 'student2001',
          cells: { Midterm: { existing: 60, inFile: null, changed: false } },
        },
      ]}
    />,
  );

  expect(screen.getByText('60')).toBeInTheDocument();
});

it('renders an em-dash for a component the row has no cell for', () => {
  render(
    <ExternalGradeConflictTable
      componentNames={['Midterm', 'Final']}
      identifierLabel="External ID"
      rows={[
        {
          identifier: 'S3000',
          studentName: 'student3000',
          cells: { Midterm: { existing: 50, inFile: 60, changed: true } },
        },
      ]}
    />,
  );

  // Final column has no cell for this row → em-dash
  expect(screen.getByText('—')).toBeInTheDocument();
});

it('shows an em-dash for the missing side of a changed cell', () => {
  render(
    <ExternalGradeConflictTable
      componentNames={['Midterm']}
      identifierLabel="External ID"
      rows={[
        {
          identifier: 'S4000',
          studentName: 'student4000',
          cells: { Midterm: { existing: null, inFile: 88, changed: true } },
        },
      ]}
    />,
  );

  expect(screen.getByText('—')).toBeInTheDocument();
  expect(screen.getByText('88')).toHaveStyle({ fontWeight: 700 });
});

it('renders the identifier label, Name header, and a header per component', () => {
  render(
    <ExternalGradeConflictTable
      componentNames={['Midterm', 'Final']}
      identifierLabel="External ID"
      rows={rows}
    />,
  );

  expect(screen.getByText('External ID')).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('Midterm')).toBeInTheDocument();
  expect(screen.getByText('Final')).toBeInTheDocument();
});

it('renders each row identifier and student name', () => {
  render(
    <ExternalGradeConflictTable
      componentNames={['Midterm']}
      identifierLabel="External ID"
      rows={rows}
    />,
  );

  expect(screen.getByText('S1000')).toBeInTheDocument();
  expect(screen.getByText('student1000')).toBeInTheDocument();
});
