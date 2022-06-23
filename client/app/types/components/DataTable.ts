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
    setCellProps?: () => CSSProperties;
    setCellHeaderProps?: () => CSSProperties;
    customBodyRenderLite?: (dataIndex: number) => string | JSX.Element | number;
    customHeadLabelRender?: () => JSX.Element | null;
    customHeadRender?: () => JSX.Element | null;
  };
}

export interface TableOptions {
  download: boolean;
  filter: boolean;
  print: boolean;
  pagination: boolean;
  search: boolean;
  selectableRows: string;
  setRowProps: (row, dataIndex: number, rowIndex: number) => any;
  viewColumns: boolean;
}

export interface TableRowMeta {
  rowIndex: number;
  dataIndex: number;
}
