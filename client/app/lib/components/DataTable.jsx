import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import MUIDataTable from 'mui-datatables';

const options = {
  filter: true,
  filterType: 'dropdown',
  responsive: 'standard',
  fixedSelectColumn: false,
};

const processTheme = (theme, newHeight, grid, alignCenter, newPadding) =>
  createTheme({
    ...theme,
    components: {
      ...theme.components,
      MUIDataTableHeadCell: { styleOverrides: { fixedHeader: { zIndex: 0 } } },
      MuiTablePagination: {
        styleOverrides: {
          selectLabel: { marginBottom: 0 },
          displayedRows: { marginBottom: 0 },
          root: { overflow: 'visible' },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          ...theme.components.MuiTableCell?.styleOverrides,
          root: {
            ...theme.components.MuiTableCell?.styleOverrides.root,
            height:
              newHeight ??
              theme.components.MuiTableCell?.styleOverrides.root.height,
            padding:
              newPadding ??
              theme.components.MuiTableCell?.styleOverrides.root.padding,
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          ...theme.components.MuiTableCell?.styleOverrides,
          root: {
            ...theme.components.MuiTableCell?.styleOverrides.root,
            display: grid ? 'grid' : 'flex',
            alignContent: alignCenter ? 'center' : 'inherit',
          },
        },
      },
      MUIDataTableSelectCell: {
        // Soft hide the button.
        styleOverrides: { expandDisabled: { visibility: 'hidden' } },
      },
    },
  });

const processColumns = (includeRowNumber, columns) => {
  if (!columns) return columns;

  if (includeRowNumber) {
    columns.unshift({
      name: 'S/N',
      options: {
        sort: false,
        filter: false,
        customBodyRender: (value, meta) => meta.rowIndex + 1,
        download: false,
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
const DataTable = (props) => {
  const theme = useTheme();

  return (
    <ThemeProvider
      theme={processTheme(
        theme,
        props.height,
        props.titleGrid,
        props.titleAlignCenter,
        props.padding,
      )}
    >
      <MUIDataTable
        {...props}
        columns={processColumns(props.includeRowNumber, props.columns)}
        elevation={1}
        options={{ ...options, ...(props.options ?? {}) }}
      />
    </ThemeProvider>
  );
};

DataTable.propTypes = MUIDataTable.propTypes;

export default DataTable;
