import { CSSProperties } from 'react';

export interface TableColumns {
  name: string;
  label: string | JSX.Element;
  options: {
    alignCenter?: boolean;
    alignLeft?: boolean;
    alignRight?: boolean;
    customBodyRenderLite?: (dataIndex: number) => string | JSX.Element | number;
    customBodyRender?: (value, tableMeta, updateValue) => JSX.Element;
    customHeadLabelRender?: () => JSX.Element | null;
    customHeadRender?: () => JSX.Element | null;
    display?: boolean;
    download?: boolean;
    empty?: boolean;
    filter?: boolean;
    filterList?: string[];
    justifyCenter?: boolean;
    justifyLeft?: boolean;
    justifyRight?: boolean;
    search?: boolean;
    setCellProps?: (
      cellValue: string,
      rowIndex: number,
      columnIndex: number,
    ) => { style: CSSProperties };
    setCellHeaderProps?: () => { style: CSSProperties };
    sort?: boolean;
  };
}

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
  onRowClick?: (
    rowData: string[],
    rowMeta: { dataIndex: number; rowIndex: number },
  ) => void;
  onTableChange?: (action: string, newTableState: TableState) => void;
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
  renderExpandableRow?: (
    rowData,
    rowMeta: { rowIndex: number; dataIndex: number },
  ) => void;
}

export interface TableState {
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

export interface TableDownloadOptions {
  filename: string;
  separator?: string;
  filterOptions?: {
    useDisplayedColumnsOnly?: boolean;
    useDisplayedRowsOnly?: boolean;
  };
}
