export interface TableColumns {
  name: string;
  label: string;
  options: {
    filter?: boolean;
    search?: boolean;
    sort?: boolean;
    customBodyRenderLite?: (dataIndex: number) => string | JSX.Element;
    customHeadLabelRender?: () => JSX.Element;
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
