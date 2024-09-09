import { ReactNode } from 'react';

export type Data = object;

interface FilteringProps<D> {
  beforeFilter?: (value: string) => unknown;
  shouldInclude?: (datum: D, filterValue) => boolean;
  getLabel?: (value) => string;
  getValue?: (datum: D) => string[];
}

interface SearchingProps<D> {
  getValue?: (datum: D) => string | undefined;
}

interface SortingProps<D> {
  sort?: (datumA: D, datumB: D) => number;
  undefinedPriority?: false | 'first' | 'last';
}

interface ColumnTemplate<D extends Data> {
  title: string;
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
}

export default ColumnTemplate;
