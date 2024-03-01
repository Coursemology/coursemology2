import { CSSProperties } from 'react';

/**
 * @deprecated `Use `lib/components/table` instead.
 */
export interface TableColumns {
  name: string;
  label: string | JSX.Element;
  options: {
    alignCenter?: boolean;
    alignLeft?: boolean;
    alignRight?: boolean;
    customBodyRenderLite?: (
      dataIndex: number,
    ) => JSX.Element | string | number | null;
    customBodyRender?: (value, tableMeta, updateValue) => JSX.Element;
    customHeadLabelRender?: () => JSX.Element | null;
    customHeadRender?: () => JSX.Element | null;
    display?: boolean;
    download?: boolean;
    empty?: boolean;
    filter?: boolean;
    filterList?: string[];
    filterType?:
      | 'checkbox'
      | 'dropdown'
      | 'multiselect'
      | 'textField'
      | 'custom';
    filterOptions?: {
      fullWidth?: boolean;
      logic?: (cellValue, filters) => boolean;
    };
    customFilterListOptions?: {
      render?: (value: string) => string;
    };
    hint?: string;
    hideInSmallScreen?: boolean;
    justifyCenter?: boolean;
    justifyLeft?: boolean;
    justifyRight?: boolean;
    search?: boolean;
    setCellProps?: (
      cellValue: string,
      rowIndex: number,
      columnIndex: number,
    ) => { className?: string; style?: CSSProperties };
    setCellHeaderProps?: () => { className?: string; style?: CSSProperties };
    sort?: boolean;
    sortDescFirst?: boolean;
    sortCompare?: (order: string) => (value1, value2) => number;
  };
}

/**
 * @deprecated `DataTable` is deprecated.
 */
export interface TableOptions {
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
  downloadOptions?: TableDownloadOptions;
  expandableRows?: boolean;
  expandableRowsHeader?: boolean;
  expandableRowsOnClick?: boolean;
  filter?: boolean;
  jumpToPage?: boolean;
  onFilterChange?: (changedColumn: string, filterList) => void;
  onRowClick?: (
    rowData: string[],
    rowMeta: { dataIndex: number; rowIndex: number },
  ) => void;
  onTableChange?: (action: string, newTableState: TableState) => void;
  print?: boolean;
  pagination?: boolean;
  rowHover?: boolean;
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
  renderExpandableRow?: (
    rowData,
    rowMeta: { rowIndex: number; dataIndex: number },
  ) => void;
}

/**
 * @deprecated `DataTable` is deprecated.
 */
export interface TableState {
  page?: number;
  count?: number;
  rowsPerPage?: number;
  searchText?: string;
  sortOrder?: Object;
}

/**
 * @deprecated `DataTable` is deprecated.
 */
export interface TableRowMeta {
  rowIndex: number;
  dataIndex: number;
}

/**
 * @deprecated `DataTable` is deprecated.
 */
export interface TableDownloadOptions {
  filename: string;
  separator?: string;
  filterOptions?: {
    useDisplayedColumnsOnly?: boolean;
    useDisplayedRowsOnly?: boolean;
  };
}
