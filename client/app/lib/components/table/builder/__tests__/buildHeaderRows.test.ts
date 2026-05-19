import { buildHeaderRows } from '../buildHeaderRows';
import type ColumnTemplate from '../ColumnTemplate';

interface D {
  id: string;
  name: string;
}

const col = (
  id: string,
  overrides: Partial<ColumnTemplate<D>> = {},
): ColumnTemplate<D> => ({
  id,
  title: id,
  cell: () => null,
  ...overrides,
});

const buildLeaf = (_column: ColumnTemplate<D>, index: number): string =>
  `leaf-${index}`;

describe('buildHeaderRows', () => {
  it('returns [] for empty columns', () => {
    expect(buildHeaderRows([], buildLeaf)).toEqual([]);
  });

  it('flat columns, no pin, no groupPath → single isLeaf row in declaration order', () => {
    const cols = [col('a'), col('b'), col('c')];
    const rows = buildHeaderRows(cols, buildLeaf);

    expect(rows).toHaveLength(1);
    expect(rows[0].isLeaf).toBe(true);
    expect(rows[0].cells).toHaveLength(3);
    rows[0].cells.forEach((cell, i) => {
      expect(cell.colSpan).toBe(1);
      expect(cell.rowSpan).toBe(1);
      expect(cell.leaf).toBe(`leaf-${i}`);
      expect(cell.render).toBeUndefined();
    });
  });

  it('flat with one left pin → pin cell first', () => {
    const cols = [col('mid'), col('pinned', { pin: 'left', widthPx: 100 })];
    const rows = buildHeaderRows(cols, buildLeaf);

    expect(rows).toHaveLength(1);
    expect(rows[0].isLeaf).toBe(true);
    const [first, second] = rows[0].cells;
    expect(first.pin).toBe('left');
    expect(second.pin).toBeUndefined();
  });

  it('flat with pins on both sides → leftPin first, rightPin last', () => {
    const cols = [
      col('mid'),
      col('right', { pin: 'right', widthPx: 80 }),
      col('left', { pin: 'left', widthPx: 80 }),
    ];
    const rows = buildHeaderRows(cols, buildLeaf);

    expect(rows).toHaveLength(1);
    const [first, second, third] = rows[0].cells;
    expect(first.pin).toBe('left');
    expect(second.pin).toBeUndefined();
    expect(third.pin).toBe('right');
  });

  it('depth-1 groupPath with two contiguous groups → 2 rows', () => {
    const cols = [
      col('a', { groupPath: [{ id: 'g1', title: 'G1' }] }),
      col('b', { groupPath: [{ id: 'g1', title: 'G1' }] }),
      col('c', { groupPath: [{ id: 'g2', title: 'G2' }] }),
    ];
    const rows = buildHeaderRows(cols, buildLeaf);

    expect(rows).toHaveLength(2);

    const [groupRow, leafRow] = rows;
    expect(groupRow.isLeaf).toBe(false);
    expect(groupRow.cells).toHaveLength(2);
    expect(groupRow.cells[0].colSpan).toBe(2);
    expect(groupRow.cells[0].render).toBe('G1');
    expect(groupRow.cells[0].leaf).toBeUndefined();
    expect(groupRow.cells[1].colSpan).toBe(1);
    expect(groupRow.cells[1].render).toBe('G2');

    expect(leafRow.isLeaf).toBe(true);
    expect(leafRow.cells).toHaveLength(3);
    leafRow.cells.forEach((cell) => expect(cell.leaf).toBeDefined());
  });

  it('depth-2 groupPath → 3 rows', () => {
    const cols = [
      col('a', {
        groupPath: [
          { id: 'outer', title: 'Outer' },
          { id: 'inner1', title: 'Inner1' },
        ],
      }),
      col('b', {
        groupPath: [
          { id: 'outer', title: 'Outer' },
          { id: 'inner2', title: 'Inner2' },
        ],
      }),
    ];
    const rows = buildHeaderRows(cols, buildLeaf);

    expect(rows).toHaveLength(3);
    expect(rows[0].isLeaf).toBe(false);
    expect(rows[1].isLeaf).toBe(false);
    expect(rows[2].isLeaf).toBe(true);
    // outer row: one group spanning 2
    expect(rows[0].cells).toHaveLength(1);
    expect(rows[0].cells[0].colSpan).toBe(2);
    // inner row: two groups spanning 1 each
    expect(rows[1].cells).toHaveLength(2);
    expect(rows[1].cells[0].colSpan).toBe(1);
    expect(rows[1].cells[1].colSpan).toBe(1);
    // leaf row
    expect(rows[2].cells).toHaveLength(2);
  });

  it('depth-1 with left + right pin → 2 rows, pin cells rowSpan 2 on row 0', () => {
    const cols = [
      col('mid', { groupPath: [{ id: 'g', title: 'G' }] }),
      col('lpn', { pin: 'left', widthPx: 60 }),
      col('rpn', { pin: 'right', widthPx: 60 }),
    ];
    const rows = buildHeaderRows(cols, buildLeaf);

    expect(rows).toHaveLength(2);

    const groupRow = rows[0];
    expect(groupRow.cells[0].pin).toBe('left');
    expect(groupRow.cells[0].rowSpan).toBe(2);
    expect(groupRow.cells[0].leaf).toBeDefined();
    expect(groupRow.cells[0].render).toBeUndefined();

    expect(groupRow.cells[2].pin).toBe('right');
    expect(groupRow.cells[2].rowSpan).toBe(2);
    expect(groupRow.cells[2].leaf).toBeDefined();
    expect(groupRow.cells[2].render).toBeUndefined();

    // Middle group cell
    expect(groupRow.cells[1].render).toBe('G');
    expect(groupRow.cells[1].leaf).toBeUndefined();

    // Leaf row has only middle columns
    const leafRow = rows[1];
    expect(leafRow.cells).toHaveLength(1);
    expect(leafRow.cells[0].pin).toBeUndefined();
  });

  it('depth-2 with two-column left pin → 3 rows, both pins rowSpan 3 on row 0', () => {
    const cols = [
      col('mid', {
        groupPath: [
          { id: 'o', title: 'O' },
          { id: 'i', title: 'I' },
        ],
      }),
      col('lp1', { pin: 'left', widthPx: 50 }),
      col('lp2', { pin: 'left', widthPx: 70 }),
    ];
    const rows = buildHeaderRows(cols, buildLeaf);

    expect(rows).toHaveLength(3);
    const row0 = rows[0];
    const pinCells = row0.cells.filter((c) => c.pin === 'left');
    expect(pinCells).toHaveLength(2);
    pinCells.forEach((c) => {
      expect(c.rowSpan).toBe(3);
      expect(c.colSpan).toBe(1);
    });
    // declaration order within the left side is preserved
    expect(pinCells[0].key).toBe('lp1');
    expect(pinCells[1].key).toBe('lp2');
  });

  it('depth-1 with two-column right pin → 2 rows, both right pins present', () => {
    const cols = [
      col('mid', { groupPath: [{ id: 'g', title: 'G' }] }),
      col('rp1', { pin: 'right', widthPx: 50 }),
      col('rp2', { pin: 'right', widthPx: 80 }),
    ];
    const rows = buildHeaderRows(cols, buildLeaf);
    expect(rows).toHaveLength(2);

    const rightPins = rows[0].cells.filter((c) => c.pin === 'right');
    expect(rightPins).toHaveLength(2);
  });

  it('per-cell invariant: exactly one of render/leaf is set across depth-2 + pinned fixture', () => {
    const cols = [
      col('mid1', {
        groupPath: [
          { id: 'o', title: 'Outer' },
          { id: 'i1', title: 'Inner1' },
        ],
      }),
      col('mid2', {
        groupPath: [
          { id: 'o', title: 'Outer' },
          { id: 'i2', title: 'Inner2' },
        ],
      }),
      col('lp', { pin: 'left', widthPx: 100 }),
    ];
    const rows = buildHeaderRows(cols, buildLeaf);

    rows.forEach((row) => {
      row.cells.forEach((cell) => {
        const hasRender = cell.render !== undefined;
        const hasLeaf = cell.leaf !== undefined;
        expect(hasRender !== hasLeaf).toBe(true);
      });
    });
  });

  it('dev error: pin without widthPx throws in development', () => {
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      expect(() =>
        buildHeaderRows([col('p', { pin: 'left' })], buildLeaf),
      ).toThrow();
    } finally {
      process.env.NODE_ENV = orig;
    }
  });

  it('dev error: inconsistent groupPath depths throws in development', () => {
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      expect(() =>
        buildHeaderRows(
          [
            col('a', { groupPath: [{ id: 'g', title: 'G' }] }),
            col('b'), // depth 0 vs depth 1
          ],
          buildLeaf,
        ),
      ).toThrow();
    } finally {
      process.env.NODE_ENV = orig;
    }
  });

  it('dev warning: non-contiguous same-id runs warns in development', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      buildHeaderRows(
        [
          col('a', { groupPath: [{ id: 'x', title: 'X' }] }),
          col('b', { groupPath: [{ id: 'x', title: 'X' }] }),
          col('c', { groupPath: [{ id: 'y', title: 'Y' }] }),
          col('d', { groupPath: [{ id: 'x', title: 'X' }] }), // non-contiguous
        ],
        buildLeaf,
      );
      expect(warnSpy).toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = orig;
      warnSpy.mockRestore();
    }
  });

  it('pin render-order invariant: declared mid/pin mix is reordered to leftPin, mid, rightPin', () => {
    const cols = [
      col('mid1'),
      col('lp', { pin: 'left', widthPx: 80 }),
      col('mid2'),
      col('rp', { pin: 'right', widthPx: 80 }),
      col('mid3'),
    ];
    const rows = buildHeaderRows(cols, buildLeaf);

    expect(rows).toHaveLength(1);
    const [c0, c1, c2, c3, c4] = rows[0].cells;
    expect(c0.key).toBe('lp');
    expect(c1.key).toBe('mid1');
    expect(c2.key).toBe('mid2');
    expect(c3.key).toBe('mid3');
    expect(c4.key).toBe('rp');
  });
});
