import { render, screen } from 'test-utils';

import Table from '../Table';
import type { TableTemplate } from '../builder';

type Row = { id: string; name: string; score: number };

const rows: Row[] = [
  { id: '1', name: 'Alice', score: 90 },
  { id: '2', name: 'Bob', score: 80 },
];

const flatColumns: TableTemplate<Row>['columns'] = [
  { id: 'name', title: 'Name', cell: (r) => r.name, sortable: true },
  { id: 'score', title: 'Score', cell: (r) => r.score },
];

describe('<Table /> — flat consumer regression', () => {
  it('renders one thead tr with no data-table-pin attributes', () => {
    const { container } = render(
      <Table
        columns={flatColumns}
        data={rows}
        getRowId={(r) => r.id}
      />,
    );

    const headerRows = container.querySelectorAll('thead tr');
    expect(headerRows).toHaveLength(1);

    const allCells = container.querySelectorAll('th, td');
    allCells.forEach((cell) => {
      expect(cell.getAttribute('data-table-pin')).toBeNull();
    });
  });

  it('renders a sort handle on sortable columns', () => {
    render(
      <Table
        columns={flatColumns}
        data={rows}
        getRowId={(r) => r.id}
      />,
    );
    expect(screen.getByRole('button', { name: /Name/i })).toBeTruthy();
  });

  it('container has no maxHeight style when maxHeight not provided', () => {
    const { container } = render(
      <Table
        columns={flatColumns}
        data={rows}
        getRowId={(r) => r.id}
      />,
    );
    const tableContainer = container.querySelector('.MuiTableContainer-root') as HTMLElement | null;
    expect(tableContainer?.style.maxHeight ?? '').toBe('');
  });
});

describe('<Table /> — grouped + pinned + scroll-contained', () => {
  const groupedColumns: TableTemplate<Row>['columns'] = [
    {
      id: 'pinnedName',
      title: 'Student',
      cell: (r) => r.name,
      pin: 'left',
      widthPx: 120,
    },
    {
      id: 'score',
      title: 'Score',
      cell: (r) => r.score,
      groupPath: [
        { id: 'outer', title: 'Outer Group' },
        { id: 'inner', title: 'Inner Group' },
      ],
    },
    {
      id: 'pinnedScore',
      title: 'Total',
      cell: (r) => r.score,
      pin: 'right',
      widthPx: 80,
    },
  ];

  it('renders 3 thead tr elements for depth-2 groupPath', () => {
    const { container } = render(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    const headerRows = container.querySelectorAll('thead tr');
    expect(headerRows).toHaveLength(3);
  });

  it('pinned th has correct data-table-pin attributes', () => {
    const { container } = render(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    const leftPins = container.querySelectorAll('th[data-table-pin="left"]');
    const rightPins = container.querySelectorAll('th[data-table-pin="right"]');
    expect(leftPins.length).toBeGreaterThan(0);
    expect(rightPins.length).toBeGreaterThan(0);
  });

  it('left pin has offset 0, right pin has offset 0', () => {
    const { container } = render(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    const leftPin = container.querySelector('th[data-table-pin="left"]') as HTMLElement;
    const rightPin = container.querySelector('th[data-table-pin="right"]') as HTMLElement;
    expect(leftPin.getAttribute('data-table-pin-offset-px')).toBe('0');
    expect(rightPin.getAttribute('data-table-pin-offset-px')).toBe('0');
  });

  it('pinned cells have data-table-cell-kind="leaf", group cells have "group"', () => {
    const { container } = render(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    const leafCells = container.querySelectorAll('[data-table-cell-kind="leaf"]');
    const groupCells = container.querySelectorAll('[data-table-cell-kind="group"]');
    expect(leafCells.length).toBeGreaterThan(0);
    expect(groupCells.length).toBeGreaterThan(0);
  });

  it('container has maxHeight style when maxHeight is provided', () => {
    const { container } = render(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    const tableContainer = container.querySelector('.MuiTableContainer-root') as HTMLElement | null;
    expect(tableContainer?.style.maxHeight).toBe('400px');
  });

  it('colSpan/rowSpan HTML attributes are set correctly on header cells', () => {
    const { container } = render(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    const headerRows = container.querySelectorAll('thead tr');

    // Row 0: leftPin (rowSpan=3), outer group (colSpan=1,rowSpan=1), rightPin (rowSpan=3)
    const row0Cells = headerRows[0].querySelectorAll('th');
    const leftPinCell = Array.from(row0Cells).find(
      (c) => c.getAttribute('data-table-pin') === 'left',
    );
    expect(leftPinCell?.getAttribute('rowspan')).toBe('3');

    const outerGroupCell = Array.from(row0Cells).find(
      (c) => c.getAttribute('data-table-cell-kind') === 'group',
    );
    expect(outerGroupCell).toBeTruthy();
  });
});

describe('<Table /> — flat with one pin, no maxHeight', () => {
  const flatWithPin: TableTemplate<Row>['columns'] = [
    {
      id: 'pinnedName',
      title: 'Name',
      cell: (r) => r.name,
      pin: 'left',
      widthPx: 100,
    },
    { id: 'score', title: 'Score', cell: (r) => r.score },
  ];

  it('renders one thead tr', () => {
    const { container } = render(
      <Table columns={flatWithPin} data={rows} getRowId={(r) => r.id} />,
    );
    expect(container.querySelectorAll('thead tr')).toHaveLength(1);
  });

  it('container has no maxHeight style', () => {
    const { container } = render(
      <Table columns={flatWithPin} data={rows} getRowId={(r) => r.id} />,
    );
    const tableContainer = container.querySelector('.MuiTableContainer-root') as HTMLElement | null;
    expect(tableContainer?.style.maxHeight ?? '').toBe('');
  });

  it('body td for pinned column has data-table-pin="left"', () => {
    const { container } = render(
      <Table columns={flatWithPin} data={rows} getRowId={(r) => r.id} />,
    );
    const pinnedBodyCells = container.querySelectorAll('td[data-table-pin="left"]');
    expect(pinnedBodyCells.length).toBeGreaterThan(0);
  });
});

describe('<Table /> — sort UI on leaf cells only', () => {
  const depthOneWithSort: TableTemplate<Row>['columns'] = [
    {
      id: 'pinnedName',
      title: 'Student',
      cell: (r) => r.name,
      pin: 'left',
      widthPx: 120,
      sortable: true,
    },
    {
      id: 'score',
      title: 'Score',
      cell: (r) => r.score,
      groupPath: [{ id: 'g', title: 'Scores' }],
      sortable: true,
    },
  ];

  it('sort handle appears on pinned (leaf) cell and leaf-row cell, not on group cell', () => {
    const { container } = render(
      <Table columns={depthOneWithSort} data={rows} getRowId={(r) => r.id} />,
    );
    const headerRows = container.querySelectorAll('thead tr');
    expect(headerRows).toHaveLength(2);

    // Row 0 contains the pinned leaf cell (has sort) and the group cell (no sort)
    const row0Cells = headerRows[0].querySelectorAll('th');
    const pinnedCell = Array.from(row0Cells).find(
      (c) => c.getAttribute('data-table-pin') === 'left',
    );
    expect(pinnedCell?.querySelector('[role="button"]')).toBeTruthy();

    const groupCell = Array.from(row0Cells).find(
      (c) => c.getAttribute('data-table-cell-kind') === 'group',
    );
    expect(groupCell?.querySelector('[role="button"]')).toBeNull();

    // Row 1 (leaf row) — sort handle on the score column
    const row1Cells = headerRows[1].querySelectorAll('th');
    expect(
      Array.from(row1Cells).some((c) => c.querySelector('[role="button"]')),
    ).toBe(true);
  });
});
