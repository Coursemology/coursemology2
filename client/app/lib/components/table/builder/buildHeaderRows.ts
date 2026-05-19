import { ReactNode } from 'react';

import type ColumnTemplate from './ColumnTemplate';
import type { Data, GroupSegment } from './ColumnTemplate';

interface BaseHeaderCell {
  key: string;
  colSpan: number;
  rowSpan: number;
}

/**
 * A header cell that labels a span of columns (e.g. "Revenue" spanning three
 * sub-columns). Always sits in a group row, never in the leaf row.
 *
 * `leaf?: never` enforces that group cells are purely labels — they have no
 * data column associated with them and no `buildLeafRender` payload. A renderer
 * can never accidentally treat a group cell as if it had data. The side effect
 * is that it makes `HeaderCell` a proper discriminated union: with `leaf?: never`
 * the only valid value is `undefined`, so a truthy `cell.leaf` check narrows
 * `HeaderCell` to `LeafHeaderCell<Leaf>`.
 *
 * Per-group styling (`className`) is not supported because group cells are
 * synthesised from `GroupSegment` entries, which carry no `className`. To add
 * it: (1) add `className?: string` to `GroupSegment` in `ColumnTemplate.ts`,
 * (2) add `className?: string` here, (3) thread `seg.className` through
 * `buildGroupCells` when constructing each cell.
 */
export interface GroupHeaderCell extends BaseHeaderCell {
  render?: ReactNode;
  leaf?: never;
  widthPx?: never;
  pin?: never;
  className?: never;
}

/**
 * A header cell that directly represents a data column (the leaf row). Always
 * sits in the bottom header row.
 *
 * `render?: never` enforces that leaf cells must express their content through
 * `leaf` (the caller-supplied payload via `buildLeafRender`), never through a
 * raw `ReactNode`. This closes off accidentally bypassing the `buildLeafRender`
 * mechanism by shoving a `ReactNode` directly into the cell. The side effect is
 * that a truthy `cell.render` check narrows `HeaderCell` to `GroupHeaderCell`.
 *
 * Pinned columns are also `LeafHeaderCell`s — they represent data columns fixed
 * to an edge. Because `ColumnTemplate` forbids `groupPath` on pinned columns,
 * they have no group hierarchy above them. Instead they are placed in row 0
 * with `rowSpan = depth + 1` so they visually span all header rows.
 *
 * `widthPx` is present here but absent on `GroupHeaderCell` because only leaf
 * cells ever need an explicit pixel width — group cells derive their width from
 * the sum of their children via `colSpan`, so declaring one would be redundant
 * and potentially contradictory.
 *
 * `Leaf = unknown` rather than `ReactNode` because the leaf value is
 * caller-defined via `buildLeafRender` — in practice it is a TanStack
 * `Header` object (when used with `useTanStackTableBuilder`) or a `ReactNode`
 * (for simpler renderers). TypeScript infers the concrete type from the
 * `buildLeafRender` signature, so the default is rarely needed directly.
 */
export interface LeafHeaderCell<Leaf = unknown> extends BaseHeaderCell {
  render?: never;
  leaf: Leaf;
  widthPx?: number;
  pin?: 'left' | 'right';
  className?: string;
}

/** A cell in a header row — either a group label or a leaf column header. */
export type HeaderCell<Leaf = unknown> = GroupHeaderCell | LeafHeaderCell<Leaf>;

/**
 * One row in the rendered table header.
 *
 * `isLeaf` is true only for the bottom row, which maps 1-to-1 with data
 * columns. Renderers use this to know where to attach sort/filter controls.
 * All rows above it are group rows (`isLeaf: false`).
 */
export interface HeaderRow<Leaf = unknown> {
  cells: HeaderCell<Leaf>[];
  isLeaf: boolean;
  rowKey: string;
}

/**
 * Caller-supplied function that maps a `ColumnTemplate` to whatever leaf
 * type the renderer needs (e.g. a `HeaderRender` with sort/filter callbacks).
 * This is the seam between the generic builder and a specific renderer.
 */
export type BuildLeafRender<D extends Data, Leaf> = (
  column: ColumnTemplate<D>,
  index: number,
) => Leaf;

const getDepth = (path?: GroupSegment[]): number => path?.length ?? 0;

/**
 * Builds the group cells for one header row at depth `r`.
 *
 * Scans `middle` left-to-right and collapses contiguous runs of columns that
 * share the same `groupPath[r].id` into a single `GroupHeaderCell` whose
 * `colSpan` equals the run length. Columns with distinct ids each produce
 * their own cell with `colSpan: 1`.
 *
 * To add per-group styling, thread `seg.className` into the pushed cell once
 * `GroupSegment.className` and `GroupHeaderCell.className` are defined.
 *
 * Pinned columns are never passed here — `ColumnTemplate` forbids `groupPath`
 * on pinned columns (`PinnedColumn.groupPath?: never`), and they are handled
 * separately as full-height `LeafHeaderCell`s that span all rows.
 */
const buildGroupCells = <D extends Data>(
  middle: { col: ColumnTemplate<D>; index: number }[],
  r: number,
): GroupHeaderCell[] => {
  const cells: GroupHeaderCell[] = [];
  let runStart = 0;
  while (runStart < middle.length) {
    const seg = middle[runStart].col.groupPath?.[r];
    let runEnd = runStart + 1;
    while (
      runEnd < middle.length &&
      middle[runEnd].col.groupPath?.[r]?.id === seg?.id
    ) {
      runEnd += 1;
    }
    cells.push({
      key: `r${r}:${runStart}`,
      render: seg?.title,
      colSpan: runEnd - runStart,
      rowSpan: 1,
    });
    runStart = runEnd;
  }
  return cells;
};

/**
 * Validates constraints that cannot be expressed in TypeScript's type system.
 *
 * TypeScript checks each `ColumnTemplate` value in isolation at construction
 * time. The two constraints below are *cross-element* — they require comparing
 * values across every column in the array simultaneously, which TypeScript has
 * no mechanism to express.
 *
 * (0) Duplicate column ids: duplicate `id` values produce duplicate React keys,
 *     corrupting reconciliation — rows may not update correctly, sort state may
 *     attach to the wrong column, selections may bleed. Easy to introduce by
 *     copy-pasting a column definition; hard to debug without an explicit
 *     warning. TypeScript cannot express uniqueness constraints on optional
 *     fields across an array.
 *
 * (1) Consistent groupPath depth: every non-pinned column must declare the
 *     same number of group rows (`groupPath.length`). TypeScript cannot assert
 *     "all elements of this array must have the same `.groupPath.length`".
 *     If depths differ, `buildHeaderRows` uses the maximum — shorter columns
 *     would produce `undefined` segments, silently generating blank group cells
 *     instead of failing visibly.
 *
 * (2) Same-id adjacency within a parent: columns sharing the same
 *     `groupPath[r].id` under the same parent group must be adjacent. If they
 *     are not, the run-length scan produces two separate group cells with
 *     identical labels rather than one merged spanning cell — a broken header.
 *     Sharing the same id under *different* parents is valid and expected (e.g.
 *     an "Exercises" tab under both "Mission" and "Exams" correctly produces
 *     two separate cells). TypeScript cannot express ordering constraints across
 *     array elements.
 *
 * Only runs when `NODE_ENV !== 'production'`. Behaviour differs by environment:
 * in development, depth errors throw; in test, they only `console.error` so a
 * single bad column does not abort the whole test suite. Non-adjacent same-id
 * columns within the same parent group are `console.warn` in both environments
 * (non-adjacent same-id columns under different parents are valid and do not
 * warn).
 */
const validateInvariants = <D extends Data>(
  columns: ColumnTemplate<D>[],
  middle: { col: ColumnTemplate<D>; index: number }[],
  depth: number,
): void => {
  if (process.env.NODE_ENV === 'production') return;

  const seenIds = new Set<string>();
  columns.forEach((col) => {
    if (col.id) {
      if (seenIds.has(col.id)) {
        console.warn(
          `lib/components/table: duplicate column id "${col.id}" — this produces duplicate React keys and corrupts reconciliation.`,
        );
      }
      seenIds.add(col.id);
    }
  });

  middle.forEach(({ col }) => {
    const colDepth = getDepth(col.groupPath);
    if (colDepth !== depth) {
      const msg = `lib/components/table: inconsistent groupPath depths — expected ${depth}, got ${colDepth} for column "${col.id ?? '(unnamed)'}"`;
      console.error(msg);
      if (process.env.NODE_ENV === 'development') throw new Error(msg);
    }
  });

  if (depth > 0) {
    for (let r = 0; r < depth; r += 1) {
      // Reset tracking at parent-group boundaries (r > 0 only) so that the
      // same id under different parents is not flagged — e.g. "Exercises" under
      // both "Mission" and "Exams" is valid. At r = 0 there is no parent, so
      // the check is global: non-adjacent same-id top-level groups are always
      // broken.
      let seenGroupIds = new Set<string | number>();
      let lastId: string | number | undefined;
      let lastParentId: string | number | undefined;
      middle.forEach(({ col }) => {
        if (r > 0) {
          const parentId = col.groupPath![r - 1]?.id;
          if (parentId !== lastParentId) {
            seenGroupIds = new Set();
            lastId = undefined;
            lastParentId = parentId;
          }
        }
        const id = col.groupPath![r]?.id;
        if (id !== lastId) {
          if (seenGroupIds.has(id)) {
            console.warn(
              `lib/components/table: non-contiguous group segments at depth ${r} — id "${String(id)}" appears in multiple non-adjacent runs within the same parent group.`,
            );
          }
          seenGroupIds.add(id);
          lastId = id;
        }
      });
    }
  }
};

/**
 * Converts a flat array of `ColumnTemplate`s into a row-major grid of header
 * cells, ready for a renderer to turn into `<thead>` rows.
 *
 * ## Layout model
 *
 * Columns are partitioned into three groups based on their `pin` value:
 *   - `leftPin`  — columns with `pin: 'left'`, in declaration order
 *   - `middle`   — unpinned columns, in declaration order
 *   - `rightPin` — columns with `pin: 'right'`, in declaration order
 *
 * The final visual order is always: left-pinned | middle | right-pinned.
 *
 * ## Flat headers (no groupPath)
 *
 * When no column has a `groupPath`, a single leaf row is returned containing
 * one cell per column in visual order. Every cell has `colSpan: 1, rowSpan: 1`.
 *
 * ## Grouped headers (groupPath set)
 *
 * `groupPath` has `depth` entries (depth ≥ 1). The output has `depth + 1`
 * rows: `depth` group rows followed by one leaf row.
 *
 * **Group rows (rows 0 … depth-1):**
 * At each depth `r`, adjacent middle columns that share the same
 * `groupPath[r].id` are merged into one `GroupHeaderCell` with
 * `colSpan = run length`. Columns with distinct ids each get their own cell.
 *
 * **Pinned columns in grouped headers:**
 * Pinned columns appear only in row 0 as `LeafHeaderCell`s with
 * `rowSpan = depth + 1` — they visually span all header rows including the
 * leaf row. They are NOT repeated in the leaf row. Left pins are prepended to
 * row 0; right pins are appended to row 0.
 *
 * **Leaf row (last row):**
 * One `LeafHeaderCell` per middle column. Pinned columns are absent here
 * because their rowSpan cells already cover this row.
 *
 * @param columns        Ordered array of column definitions.
 * @param buildLeafRender Renderer-supplied function to build each leaf cell's
 *                        payload (e.g. attaching sort/filter callbacks).
 */
export const buildHeaderRows = <D extends Data, Leaf>(
  columns: ColumnTemplate<D>[],
  buildLeafRender: BuildLeafRender<D, Leaf>,
): HeaderRow<Leaf>[] => {
  if (columns.length === 0) return [];

  const leftPin: { col: ColumnTemplate<D>; index: number }[] = [];
  const middle: { col: ColumnTemplate<D>; index: number }[] = [];
  const rightPin: { col: ColumnTemplate<D>; index: number }[] = [];
  columns.forEach((col, index) => {
    if (col.pin === 'left') leftPin.push({ col, index });
    else if (col.pin === 'right') rightPin.push({ col, index });
    else middle.push({ col, index });
  });

  // All non-pinned columns must share the same depth; take the max so the
  // algorithm has a defined number of group rows even if depths are inconsistent
  // (validateInvariants will have reported the error in dev/test).
  const depth = middle.reduce(
    (max, { col }) => Math.max(max, getDepth(col.groupPath)),
    0,
  );

  validateInvariants(columns, middle, depth);

  // Fast path: no group rows — single leaf row in visual order.
  if (depth === 0) {
    return [
      {
        isLeaf: true,
        rowKey: 'leaf',
        cells: [...leftPin, ...middle, ...rightPin].map(({ col, index }) => ({
          key: col.id ?? `col-${index}`,
          colSpan: 1,
          rowSpan: 1,
          widthPx: col.widthPx,
          pin: col.pin,
          className: col.className,
          leaf: buildLeafRender(col, index),
        })),
      },
    ];
  }

  // Pinned columns span every header row (group rows + the leaf row), so their
  // rowSpan equals the total number of rows. They are placed only in row 0.
  const buildPinCell = (
    col: ColumnTemplate<D>,
    index: number,
  ): HeaderCell<Leaf> => ({
    key: col.id ?? `pin-${index}`,
    colSpan: 1,
    rowSpan: depth + 1,
    widthPx: col.widthPx,
    pin: col.pin,
    className: col.className,
    leaf: buildLeafRender(col, index),
  });

  const rows: HeaderRow<Leaf>[] = [];

  for (let r = 0; r < depth; r += 1) {
    const cells: HeaderCell<Leaf>[] = [];

    // Pinned cells are added once, in the first group row only.
    if (r === 0) {
      leftPin.forEach(({ col, index }) => cells.push(buildPinCell(col, index)));
    }

    cells.push(...buildGroupCells(middle, r));

    if (r === 0) {
      rightPin.forEach(({ col, index }) =>
        cells.push(buildPinCell(col, index)),
      );
    }

    rows.push({ cells, isLeaf: false, rowKey: `group-${r}` });
  }

  // Leaf row: one cell per middle column. Pinned columns are absent — their
  // rowSpan cells from row 0 already cover this row visually.
  rows.push({
    isLeaf: true,
    rowKey: 'leaf',
    cells: middle.map(({ col, index }) => ({
      key: col.id ?? `leaf-${index}`,
      colSpan: 1,
      rowSpan: 1,
      widthPx: col.widthPx,
      className: col.className,
      leaf: buildLeafRender(col, index),
    })),
  });

  return rows;
};
