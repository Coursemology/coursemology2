import { ReactNode } from 'react';
import { StringOrTemplateHeader } from '@tanstack/react-table';

export type Data = object;

/**
 * Describes one level of a column's header group hierarchy.
 * Columns sharing the same `id` at the same depth and in a contiguous run
 * are merged into a single spanning group cell.
 */
export interface GroupSegment {
  id: string | number;
  title: ReactNode;
  /** Plain-text label for non-DOM contexts (CSV export, aria labels). */
  label?: string;
}

interface FilteringProps<D> {
  beforeFilter?: (value: string) => unknown;
  shouldInclude?: (datum: D, filterValue) => boolean;
  getLabel?: (value) => string;
  getValue?: (datum: D) => string[];
}

interface SearchingProps<D> {
  getValue?: (datum: D) => string | number | undefined;
}

interface SortingProps<D> {
  sort?: (datumA: D, datumB: D) => number;
  undefinedPriority?: false | 'first' | 'last';
}

interface ColumnTemplate<D extends Data> {
  title: StringOrTemplateHeader<D, unknown>;
  cell: (datum: D) => ReactNode;
  of?: keyof D;
  id?: string;
  unless?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  csvDownloadable?: boolean;
  filterProps?: FilteringProps<D>;
  csvValue?: (value) => string;
  sortProps?: SortingProps<D>;
  searchProps?: SearchingProps<D>;
  className?: string;
  colSpan?: (datum: D) => number;
  cellUnless?: (datum: D) => boolean;

  /**
   * Multi-level header path. Each entry describes one header row above the
   * leaf row. Columns sharing the same `id` at the same depth in a contiguous
   * run are merged into a single spanning group cell.
   *
   * All non-pinned columns must have the same `groupPath` depth. Pinned
   * columns must not set `groupPath` — they span all header rows.
   */
  groupPath?: GroupSegment[];

  /**
   * Pins the column to the left or right edge of a horizontally scrollable
   * table. Pinned columns are rendered before (left) or after (right) all
   * non-pinned columns regardless of declaration order.
   *
   * `widthPx` is required when `pin` is set.
   */
  pin?: 'left' | 'right';

  /**
   * Fixed pixel width for this column. Required when `pin` is set so the
   * sticky positioning math can compute cumulative offsets correctly.
   */
  widthPx?: number;
}

export default ColumnTemplate;
