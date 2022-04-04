import { createTheme, ThemeProvider } from '@mui/material';
import MUIDataTable from 'mui-datatables';
import { adaptedTheme } from 'lib/components/ProviderWrapper';

const options = {
  filter: true,
  filterType: 'dropdown',
  responsive: 'standard',
  fixedSelectColumn: false,
};

const theme = createTheme({
  ...adaptedTheme,
  components: {
    ...adaptedTheme.components,
    MUIDataTableHeadCell: {
      styleOverrides: {
        fixedHeader: {
          zIndex: 0,
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        selectLabel: {
          marginBottom: 0,
        },
        displayedRows: {
          marginBottom: 0,
        },
      },
    },
  },
});

const processColumns = (columns) => {
  if (!columns) {
    return columns;
  }
  return columns.map((c) => {
    if (c.options?.alignCenter) {
      return {
        ...c,
        options: {
          ...c.options,
          setCellHeaderProps: () => ({
            className: 'centered-table-head',
          }),
          setCellProps: () => ({
            align: 'center',
          }),
        },
      };
    }
    return c;
  });
};

/**
 * Props for this component are identical to MUIDataTable's.
 *
 * Refer to https://github.com/gregnb/mui-datatables for the documentation.
 */
const DataTable = (props) => (
  <ThemeProvider theme={theme}>
    <MUIDataTable
      {...props}
      columns={processColumns(props.columns)}
      elevation={1}
      options={{ ...options, ...(props.options ?? {}) }}
    />
  </ThemeProvider>
);

DataTable.propTypes = MUIDataTable.propTypes;

export default DataTable;
