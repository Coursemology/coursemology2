import { ReactNode } from 'react';

import type ColumnTemplate from './ColumnTemplate';
import type { Data, GroupSegment } from './ColumnTemplate';

export interface HeaderCell<Leaf = unknown> {
  key: string;
  /** Set only when `leaf` is undefined — group cell. */
  render?: ReactNode;
  colSpan: number;
  rowSpan: number;
  widthPx?: number;
  pin?: 'left' | 'right';
  className?: string;
  /** Present for leaf cells (data columns + pinned columns). Mutually exclusive with `render`. */
  leaf?: Leaf;
}

export interface HeaderRow<Leaf = unknown> {
  cells: HeaderCell<Leaf>[];
  isLeaf: boolean;
}

export type BuildLeafRender<D extends Data, Leaf> = (
  column: ColumnTemplate<D>,
  index: number,
) => Leaf;

const getDepth = (path?: GroupSegment[]): number => path?.length ?? 0;

const validateInvariants = <D extends Data>(
  leftPin: { col: ColumnTemplate<D>; index: number }[],
  middle: { col: ColumnTemplate<D>; index: number }[],
  rightPin: { col: ColumnTemplate<D>; index: number }[],
  depth: number,
): void => {
  if (process.env.NODE_ENV === 'production') return;

  const allPinned = [...leftPin, ...rightPin];
  allPinned.forEach(({ col }) => {
    if (col.widthPx == null) {
      const msg = `lib/components/table: pinned column "${col.id ?? '(unnamed)'}" is missing widthPx — pinned columns must have a fixed pixel width.`;
      console.error(msg);
      if (process.env.NODE_ENV === 'development') throw new Error(msg);
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
      const seenIds = new Set<string | number>();
      let lastId: string | number | undefined;
      middle.forEach(({ col }) => {
        const seg = col.groupPath![r];
        const id = seg?.id;
        if (id !== lastId) {
          if (seenIds.has(id)) {
            console.warn(
              `lib/components/table: non-contiguous group segments at depth ${r} — id "${String(id)}" appears in multiple non-adjacent runs.`,
            );
          }
          seenIds.add(id);
          lastId = id;
        }
      });
    }
  }
};

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

  const depth = middle.reduce(
    (max, { col }) => Math.max(max, getDepth(col.groupPath)),
    0,
  );

  validateInvariants(leftPin, middle, rightPin, depth);

  if (depth === 0) {
    return [
      {
        isLeaf: true,
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

    if (r === 0) {
      leftPin.forEach(({ col, index }) => cells.push(buildPinCell(col, index)));
    }

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

    if (r === 0) {
      rightPin.forEach(({ col, index }) =>
        cells.push(buildPinCell(col, index)),
      );
    }

    rows.push({ cells, isLeaf: false });
  }

  rows.push({
    isLeaf: true,
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
