import { ReactNode } from 'react';
import { StringOrTemplateHeader } from '@tanstack/react-table';

export type Data = object;

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
  hidden?: boolean;
  csvDownloadable?: boolean;
  filterProps?: FilteringProps<D>;
  csvValue?: (value) => string;
  sortProps?: SortingProps<D>;
  searchProps?: SearchingProps<D>;
  className?: string;
  colSpan?: (datum: D) => number;
  cellUnless?: (datum: D) => boolean;
}

export default ColumnTemplate;
