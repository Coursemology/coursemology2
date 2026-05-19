import { IntlProvider } from 'react-intl';
import type { RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';

import type { TableTemplate } from '../builder';
import Table from '../Table';

const LEFT_PIN_TD = 'td[data-table-pin="left"]';
const PIN_OFFSET_ATTR = 'data-table-pin-offset-px';

const Wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

const renderTable = (ui: JSX.Element): RenderResult =>
  render(ui, { wrapper: Wrapper });

interface Row {
  id: string;
  name: string;
  score: number;
}

const rows: Row[] = [
  { id: '1', name: 'Alice', score: 90 },
  { id: '2', name: 'Bob', score: 80 },
];

const flatColumns: TableTemplate<Row>['columns'] = [
  {
    id: 'name',
    of: 'name',
    title: 'Name',
    cell: (r) => r.name,
    sortable: true,
  },
  { id: 'score', of: 'score', title: 'Score', cell: (r) => r.score },
];

describe('<Table /> — flat consumer regression', () => {
  it('renders one thead tr with no data-table-pin attributes', () => {
    const { container } = renderTable(
      <Table columns={flatColumns} data={rows} getRowId={(r) => r.id} />,
    );

    const headerRows = container.querySelectorAll('thead tr');
    expect(headerRows).toHaveLength(1);

    const allCells = container.querySelectorAll('th, td');
    allCells.forEach((cell) => {
      expect(cell.getAttribute('data-table-pin')).toBeNull();
    });
  });

  it('renders a sort handle on sortable columns', () => {
    const { container } = renderTable(
      <Table columns={flatColumns} data={rows} getRowId={(r) => r.id} />,
    );
    expect(container.querySelector('.MuiTableSortLabel-root')).toBeTruthy();
  });

  it('container has no maxHeight style when maxHeight not provided', () => {
    const { container } = renderTable(
      <Table columns={flatColumns} data={rows} getRowId={(r) => r.id} />,
    );
    const tableContainer = container.querySelector(
      '.MuiTableContainer-root',
    ) as HTMLElement | null;
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
    const { container } = renderTable(
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
    const { container } = renderTable(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    // Pinned columns use rowSpan=3 and appear only in the first row DOM element
    const leftPins = container.querySelectorAll('th[data-table-pin="left"]');
    const rightPins = container.querySelectorAll('th[data-table-pin="right"]');
    expect(leftPins).toHaveLength(1);
    expect(rightPins).toHaveLength(1);
  });

  it('pinned cells have data-table-cell-kind="leaf", group cells have "group"', () => {
    const { container } = renderTable(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    // Row 0: pinnedName(leaf), outerGroup(group), pinnedScore(leaf)
    // Row 1: innerGroup(group)
    // Row 2: score(leaf)
    const leafCells = container.querySelectorAll(
      '[data-table-cell-kind="leaf"]',
    );
    const groupCells = container.querySelectorAll(
      '[data-table-cell-kind="group"]',
    );
    expect(leafCells).toHaveLength(3);
    expect(groupCells).toHaveLength(2);
  });

  it('container has maxHeight style when maxHeight is provided', () => {
    const { container } = renderTable(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    const tableContainer = container.querySelector(
      '.MuiTableContainer-root',
    ) as HTMLElement | null;
    expect(tableContainer?.style.maxHeight).toBe('400px');
  });

  it('rowSpan HTML attribute is set correctly on row-spanning pinned header cells', () => {
    const { container } = renderTable(
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

  it('table element has !border-separate class when pinned columns are present', () => {
    const { container } = renderTable(
      <Table
        columns={groupedColumns}
        data={rows}
        getRowId={(r) => r.id}
        maxHeight={400}
      />,
    );
    expect(
      container.querySelector('table')?.classList.contains('!border-separate'),
    ).toBe(true);
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
    const { container } = renderTable(
      <Table columns={flatWithPin} data={rows} getRowId={(r) => r.id} />,
    );
    expect(container.querySelectorAll('thead tr')).toHaveLength(1);
  });

  it('container has no maxHeight style', () => {
    const { container } = renderTable(
      <Table columns={flatWithPin} data={rows} getRowId={(r) => r.id} />,
    );
    const tableContainer = container.querySelector(
      '.MuiTableContainer-root',
    ) as HTMLElement | null;
    expect(tableContainer?.style.maxHeight ?? '').toBe('');
  });

  it('body td for pinned column has data-table-pin="left"', () => {
    const { container } = renderTable(
      <Table columns={flatWithPin} data={rows} getRowId={(r) => r.id} />,
    );
    const pinnedBodyCells = container.querySelectorAll(LEFT_PIN_TD);
    expect(pinnedBodyCells).toHaveLength(rows.length);
  });
});

describe('<Table /> — pin + indexing — row selector', () => {
  const pinnedWithSelector: TableTemplate<Row>['columns'] = [
    {
      id: 'pinnedName',
      title: 'Name',
      cell: (r) => r.name,
      pin: 'left',
      widthPx: 120,
    },
    { id: 'score', title: 'Score', cell: (r) => r.score },
  ];

  it('row selector body cells have data-table-pin="left"', () => {
    const { container } = renderTable(
      <Table
        columns={pinnedWithSelector}
        data={rows}
        getRowId={(r) => r.id}
        indexing={{ rowSelectable: true }}
      />,
    );
    const leftPinBodyCells = container.querySelectorAll(LEFT_PIN_TD);
    // One row-selector td + one pinnedName td per data row
    expect(leftPinBodyCells).toHaveLength(rows.length * 2);
    const checkboxCells = Array.from(leftPinBodyCells).filter((td) =>
      td.querySelector('input[type="checkbox"]'),
    );
    expect(checkboxCells).toHaveLength(rows.length);
  });

  it('row selector header cell has data-table-pin="left" and renders select-all checkbox', () => {
    const { container } = renderTable(
      <Table
        columns={pinnedWithSelector}
        data={rows}
        getRowId={(r) => r.id}
        indexing={{ rowSelectable: true }}
      />,
    );
    const leftPinHeaders = container.querySelectorAll(
      'th[data-table-pin="left"]',
    );
    // rowSelector header + pinnedName header
    expect(leftPinHeaders).toHaveLength(2);
    const hasSelectAll = Array.from(leftPinHeaders).some((th) =>
      th.querySelector('input[type="checkbox"]'),
    );
    expect(hasSelectAll).toBe(true);
  });

  it('pinned header and body cells have correct data-table-pin-offset-px values', () => {
    const { container } = renderTable(
      <Table
        columns={pinnedWithSelector}
        data={rows}
        getRowId={(r) => r.id}
        indexing={{ rowSelectable: true }}
      />,
    );
    // Left pins in order: rowSelector (widthPx=48, offset=0), pinnedName (widthPx=120, offset=48)
    const leftPinHeaders = Array.from(
      container.querySelectorAll('th[data-table-pin="left"]'),
    );
    expect(leftPinHeaders[0]?.getAttribute(PIN_OFFSET_ATTR)).toBe('0');
    expect(leftPinHeaders[1]?.getAttribute(PIN_OFFSET_ATTR)).toBe('48');

    const leftPinBodyCells = Array.from(
      container.querySelectorAll(LEFT_PIN_TD),
    );
    const selectorCells = leftPinBodyCells.filter((td) =>
      td.querySelector('input[type="checkbox"]'),
    );
    const nameCells = leftPinBodyCells.filter(
      (td) => !td.querySelector('input[type="checkbox"]'),
    );
    selectorCells.forEach((td) =>
      expect(td.getAttribute(PIN_OFFSET_ATTR)).toBe('0'),
    );
    nameCells.forEach((td) =>
      expect(td.getAttribute(PIN_OFFSET_ATTR)).toBe('48'),
    );
  });

  it('does not warn about unsupported pin + row-selector combination', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      renderTable(
        <Table
          columns={pinnedWithSelector}
          data={rows}
          getRowId={(r) => r.id}
          indexing={{ rowSelectable: true }}
        />,
      );
      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('unsupported'),
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});

describe('<Table /> — pin + indexing (indices)', () => {
  const pinnedWithIndices: TableTemplate<Row>['columns'] = [
    {
      id: 'pinnedName',
      title: 'Name',
      cell: (r) => r.name,
      pin: 'left',
      widthPx: 120,
    },
    { id: 'score', title: 'Score', cell: (r) => r.score },
  ];

  it('index body cells have data-table-pin="left"', () => {
    const { container } = renderTable(
      <Table
        columns={pinnedWithIndices}
        data={rows}
        getRowId={(r) => r.id}
        indexing={{ indices: true }}
      />,
    );
    const leftPinBodyCells = container.querySelectorAll(LEFT_PIN_TD);
    // One index td + one pinnedName td per data row
    expect(leftPinBodyCells).toHaveLength(rows.length * 2);
  });

  it('pinned header and body cells have correct data-table-pin-offset-px values', () => {
    const { container } = renderTable(
      <Table
        columns={pinnedWithIndices}
        data={rows}
        getRowId={(r) => r.id}
        indexing={{ indices: true }}
      />,
    );
    // Left pins in order: index (widthPx=48, offset=0), pinnedName (widthPx=120, offset=48)
    const leftPinHeaders = Array.from(
      container.querySelectorAll('th[data-table-pin="left"]'),
    );
    expect(leftPinHeaders[0]?.getAttribute(PIN_OFFSET_ATTR)).toBe('0');
    expect(leftPinHeaders[1]?.getAttribute(PIN_OFFSET_ATTR)).toBe('48');

    const leftPinBodyCells = Array.from(
      container.querySelectorAll(LEFT_PIN_TD),
    );
    // First cell per row (index column): offset 0; second (pinnedName): offset 48
    for (let i = 0; i < leftPinBodyCells.length; i += 2) {
      expect(leftPinBodyCells[i]?.getAttribute(PIN_OFFSET_ATTR)).toBe('0');
      expect(leftPinBodyCells[i + 1]?.getAttribute(PIN_OFFSET_ATTR)).toBe('48');
    }
  });
});

describe('<Table /> — sort UI on leaf cells only', () => {
  const depthOneWithSort: TableTemplate<Row>['columns'] = [
    {
      id: 'pinnedName',
      of: 'name',
      title: 'Student',
      cell: (r) => r.name,
      pin: 'left',
      widthPx: 120,
      sortable: true,
    },
    {
      id: 'score',
      of: 'score',
      title: 'Score',
      cell: (r) => r.score,
      groupPath: [{ id: 'g', title: 'Scores' }],
      sortable: true,
    },
  ];

  it('sort handle appears on pinned (leaf) cell and leaf-row cell, not on group cell', () => {
    const { container } = renderTable(
      <Table columns={depthOneWithSort} data={rows} getRowId={(r) => r.id} />,
    );
    const headerRows = container.querySelectorAll('thead tr');
    expect(headerRows).toHaveLength(2);

    // Row 0 contains the pinned leaf cell (has sort) and the group cell (no sort)
    const row0Cells = headerRows[0].querySelectorAll('th');
    const pinnedCell = Array.from(row0Cells).find(
      (c) => c.getAttribute('data-table-pin') === 'left',
    );
    expect(pinnedCell?.querySelector('.MuiTableSortLabel-root')).toBeTruthy();

    const groupCell = Array.from(row0Cells).find(
      (c) => c.getAttribute('data-table-cell-kind') === 'group',
    );
    expect(groupCell?.querySelector('.MuiTableSortLabel-root')).toBeNull();

    // Row 1 (leaf row) — sort handle on the score column
    const row1Cells = headerRows[1].querySelectorAll('th');
    expect(
      Array.from(row1Cells).some((c) =>
        c.querySelector('.MuiTableSortLabel-root'),
      ),
    ).toBe(true);
  });
});
