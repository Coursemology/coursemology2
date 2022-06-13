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
  overrides: {
    MUIDataTableSelectCell: {
      expandDisabled: {
        // Soft hide the button.
        visibility: 'hidden',
      },
    },
  },
});

const processColumns = (includeRowNumber, columns) => {
  if (!columns) {
    return columns;
  }
  if (includeRowNumber) {
    columns.unshift({
      name: 'S/N',
      options: {
        sort: false,
        filter: false,
        customBodyRender: (value, meta) => meta.rowIndex + 1,
      },
    });
  }

  return columns.map((c) => {
    if (c.options?.alignCenter) {
      return {
        ...c,
        options: {
          ...c.options,
          setCellHeaderProps: () => ({
            align: 'center',
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
      columns={processColumns(props.includeRowNumber, props.columns)}
      elevation={1}
      options={{ ...options, ...(props.options ?? {}) }}
    />
  </ThemeProvider>
);

DataTable.propTypes = MUIDataTable.propTypes;

export default DataTable;
