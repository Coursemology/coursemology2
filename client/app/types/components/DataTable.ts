export interface TableColumns {
  name: string;
  label: string;
  options: {
    filter?: Boolean;
    search?: Boolean;
    sort?: Boolean;
    customBodyRenderLite?: (dataIndex: number) => string | JSX.Element;
    customHeadLabelRender?: () => JSX.Element;
  };
}

export interface TableOptions {
  download: Boolean;
  filter: Boolean;
  print: Boolean;
  pagination: Boolean;
  search: Boolean;
  selectableRows: string;
  setRowProps: (row, dataIndex: number, rowIndex: number) => any;
  viewColumns: Boolean;
}
