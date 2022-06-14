import { CSSProperties } from '@mui/styles';

export interface TableColumns {
  name: string;
  label: string;
  options: {
    display?: boolean;
    filter?: boolean;
    search?: boolean;
    sort?: boolean;
    alignCenter?: boolean;
    alignLeft?: boolean;
    alignRight?: boolean;
    justifyCenter?: boolean;
    justifyLeft?: boolean;
    justifyRight?: boolean;
    empty?: boolean;
    setCellProps?: () => CSSProperties;
    setCellHeaderProps?: () => CSSProperties;
    customBodyRenderLite?: (dataIndex: number) => string | JSX.Element | number;
    customBodyRender?: (value, tableMeta, updateValue) => JSX.Element;
    customHeadLabelRender?: () => JSX.Element | null;
    customHeadRender?: () => JSX.Element | null;
  };
}

export interface TableOptions {
  customToolbar?: () => JSX.Element;
  customFooter?: () => JSX.Element | string;
  download?: boolean;
  filter?: boolean;
  jumpToPage?: boolean;
  onRowClick?: (
    rowData: string[],
    rowMeta: { dataIndex: number; rowIndex: number },
  ) => void;
  print?: boolean;
  pagination?: boolean;
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  search?: boolean;
  searchPlaceholder?: string;
  selectableRows?: string;
  selectToolbarPlacement?: string;
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
}

export interface TableRowMeta {
  rowIndex: number;
  dataIndex: number;
}
