import { CSSProperties } from '@mui/styles';

export interface TableColumns {
  name: string;
  label: string | JSX.Element;
  options: {
    display?: boolean;
    empty?: boolean;
    filter?: boolean;
    search?: boolean;
    sort?: boolean;
    alignCenter?: boolean;
    alignLeft?: boolean;
    alignRight?: boolean;
    justifyCenter?: boolean;
    justifyLeft?: boolean;
    justifyRight?: boolean;
    setCellProps?: (
      cellValue: string,
      rowIndex: number,
      columnIndex: number,
    ) => CSSProperties;
    setCellHeaderProps?: () => CSSProperties;
    customBodyRenderLite?: (dataIndex: number) => string | JSX.Element | number;
    customBodyRender?: (value, tableMeta, updateValue) => JSX.Element;
    customHeadLabelRender?: () => JSX.Element | null;
    customHeadRender?: () => JSX.Element | null;
    filterList?: string[];
  };
}

export interface TableOptions<TableData> {
  count?: number;
  customFooter?: () => JSX.Element | string;
  customSearchRender?: (
    searchText: string,
    handleSearch,
    hideSearch,
    options,
  ) => JSX.Element;
  customToolbar?: () => JSX.Element;
  download?: boolean;
  filter?: boolean;
  jumpToPage?: boolean;
  onRowClick?: (
    rowData: string[],
    rowMeta: { dataIndex: number; rowIndex: number },
  ) => void;
  onTableChange?: (
    action: string,
    newTableState: TableState<TableData>,
  ) => void;
  print?: boolean;
  pagination?: boolean;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  search?: boolean;
  searchPlaceholder?: string;
  selectableRows?: string;
  selectToolbarPlacement?: string;
  serverSide?: boolean;
  setRowProps?: (
    row: Array<unknown>,
    dataIndex: number,
    rowIndex: number,
  ) => Object;
  setTableProps?: (size: string) => Object;
  sortOrder?: Object;
  tableBodyHeight?: string;
  textLabels?: Object;
  viewColumns?: boolean;
  expandableRows?: boolean;
  expandableRowsHeader?: boolean;
  expandableRowsOnClick?: boolean;
  renderExpandableRow?: (
    rowData,
    rowMeta: { rowIndex: number; dataIndex: number },
  ) => void;
}

export interface TableState<TableData> {
  data?: TableData[];
  page?: number;
  count?: number;
  rowsPerPage?: number;
  searchText?: string;
  sortOrder?: Object;
}

export interface TableRowMeta {
  rowIndex: number;
  dataIndex: number;
}
