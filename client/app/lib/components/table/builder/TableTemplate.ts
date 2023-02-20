import ColumnTemplate, { Data } from './ColumnTemplate';
import {
  CsvDownloadTemplate,
  FilterTemplate,
  IndexingTemplate,
  PaginationTemplate,
  SearchTemplate,
  SortTemplate,
  ToolbarTemplate,
} from './featureTemplates';

interface TableTemplate<D extends Data> {
  data: D[];
  columns: ColumnTemplate<D>[];
  getRowId: (datum: D) => string;
  getRowClassName: (datum: D) => string;
  className?: string;
  pagination?: PaginationTemplate;
  csvDownload?: CsvDownloadTemplate;
  search?: SearchTemplate;
  indexing?: IndexingTemplate;
  filter?: FilterTemplate;
  toolbar?: ToolbarTemplate<D>;
  sort?: SortTemplate;
}

export default TableTemplate;
