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
  /**
   * Per-group cell styling is not yet supported — add `className?: string`
   * here, then `className?: string` to `GroupHeaderCell`, then thread
   * `seg.className` through `buildGroupCells` in `buildHeaderRows.ts`.
   */
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

interface ColumnTemplateBase<D extends Data> {
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
}

/**
 * Pins the column to the left or right edge. `widthPx` is required for
 * sticky offset math. `groupPath` is forbidden — pinned columns span all
 * header rows automatically.
 */
interface PinnedColumn {
  pin: 'left' | 'right';
  widthPx: number;
  groupPath?: never;
}

/**
 * Non-pinned column. `widthPx` is optional. `groupPath` defines multi-level
 * header rows — all non-pinned columns must share the same groupPath depth.
 */
interface UnpinnedColumn {
  pin?: never;
  widthPx?: number;
  /**
   * Multi-level header path. Each entry describes one header row above the
   * leaf row. Columns sharing the same `id` at the same depth in a contiguous
   * run are merged into a single spanning group cell.
   *
   * All non-pinned columns must have the same `groupPath` depth.
   *
   * Example — two category rows above the leaf row:
   * ```
   * | Mission       | Exams             |
   * | PE | Exercises| Exercises         |
   * | A  | B        | C      | D        |
   * ```
   * ```ts
   * { id: 'A', groupPath: [{ id: 'mission', title: 'Mission' }, { id: 'pe',        title: 'PE'        }] }
   * { id: 'B', groupPath: [{ id: 'mission', title: 'Mission' }, { id: 'exercises', title: 'Exercises' }] }
   * { id: 'C', groupPath: [{ id: 'exams',   title: 'Exams'   }, { id: 'exercises', title: 'Exercises' }] }
   * { id: 'D', groupPath: [{ id: 'exams',   title: 'Exams'   }, { id: 'exercises', title: 'Exercises' }] }
   * ```
   * A+B share `mission` at depth 0 → merged "Mission" (colSpan 2).
   * C+D share `exams` at depth 0 → merged "Exams" (colSpan 2).
   * C+D share `exercises` under the same parent `exams` → merged "Exercises"
   * (colSpan 2).
   * B+C both use `exercises` at depth 1 and are adjacent, but their parents
   * differ (`mission` vs `exams`) → two separate "Exercises" cells, not merged.
   * Merging requires the same id AND the same parent, not adjacency alone.
   */
  groupPath?: GroupSegment[];
}

type ColumnTemplate<D extends Data> = ColumnTemplateBase<D> &
  (PinnedColumn | UnpinnedColumn);

export default ColumnTemplate;
