import { Data } from './ColumnTemplate';

export interface PaginationTemplate {
  initialPageSize?: number;
  initialPageIndex?: number;
  rowsPerPage?: number[];
  showAllRows?: boolean;
  showAllRowsLabel?: string;
}

interface SearchProps<D> {
  shouldInclude?: (datum: D, filterValue) => boolean;
}

export interface CsvDownloadTemplate {
  filename?: string;
  downloadButtonLabel?: string;
}

export interface SearchTemplate<D extends Data> {
  searchPlaceholder?: string;
  searchProps?: SearchProps<D>;
}

export interface IndexingTemplate {
  rowSelectable?: boolean;
  indices?: boolean;
}

export interface FilterTemplate {
  tooltipLabel?: string;
  clearFilterTooltipLabel?: string;
}

export interface ToolbarTemplate<D extends Data> {
  show?: boolean;
  activeToolbar?: (rows: D[]) => JSX.Element;
  keepNative?: boolean;
  buttons?: JSX.Element[];
}

export interface SortTemplate {
  initially?: { by: string; order: 'asc' | 'desc' };
}
