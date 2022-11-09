import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import MUIDataTable from 'mui-datatables';

import LoadingOverlay from 'lib/components/core/LoadingOverlay';

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
        customBodyRenderLite: (_dataIndex, rowIndex) => rowIndex + 1,
        download: false,
      },
    });
  }

  return columns.map((c) => {
    if (c.options?.alignCenter || c.options?.hideInSmallScreen) {
      return {
        ...c,
        options: {
          ...c.options,
          setCellHeaderProps: () => {
            let align = null;
            let className = '';
            if (c.options?.alignCenter) {
              className += 'centered-table-head';
              align = 'center';
            }
            if (c.options?.hideInSmallScreen) {
              className += ' !hidden sm:!table-cell';
            }
            return {
              ...(align && { align }),
              className,
            };
          },
          setCellProps: () => {
            let align = null;
            let className = '';
            if (c.options?.alignCenter) {
              align = 'center';
            }
            if (c.options?.hideInSmallScreen)
              className += ' !hidden sm:!table-cell';
            return {
              ...(align && { align }),
              className,
            };
          },
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
      <div className={`relative ${props.withMargin && 'mx-0 my-3'}`}>
        {props.isLoading && <LoadingOverlay />}
        <MUIDataTable
          {...props}
          columns={processColumns(props.includeRowNumber, props.columns)}
          elevation={1}
          options={{ ...options, ...(props.options ?? {}) }}
        />
      </div>
    </ThemeProvider>
  );
};

DataTable.propTypes = MUIDataTable.propTypes;

export default DataTable;
