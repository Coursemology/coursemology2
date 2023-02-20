import { Data } from './ColumnTemplate';

export interface PaginationTemplate {
  initialPagination?: number;
  rowsPerPage?: number[];
  showAllRows?: boolean;
  showAllRowsLabel?: string;
}

export interface CsvDownloadTemplate {
  filename?: string;
  downloadButtonLabel?: string;
}

export interface SearchTemplate {
  searchPlaceholder?: string;
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
  buttons?: JSX.Element[];
}

export interface SortTemplate {
  initially?: { by: string; order: 'asc' | 'desc' };
}
