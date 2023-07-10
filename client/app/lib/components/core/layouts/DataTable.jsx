import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles';
import { produce } from 'immer';
import MUIDataTable from 'mui-datatables';

import styles from 'lib/components/core/layouts/layout.scss';
import LoadingOverlay from 'lib/components/core/LoadingOverlay';

const options = {
  filter: true,
  filterType: 'dropdown',
  responsive: 'standard',
  fixedSelectColumn: false,
  elevation: 0,
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
            width: '100%',
            height: '100%',
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
  if (!columns.length) return columns;

  const processed = columns.map((column) => {
    if (!column.options?.alignCenter && !column.options?.hideInSmallScreen)
      return column;

    return produce(column, (draft) => {
      draft.options.setCellHeaderProps = () => {
        let align = null;
        let className = '';
        if (column.options?.alignCenter) {
          className += `${styles.centeredTableHead}`;
          align = 'center';
        }
        if (column.options?.hideInSmallScreen) {
          className += ' !hidden sm:!table-cell';
        }
        return {
          ...(align && { align }),
          className,
        };
      };

      draft.options.setCellProps = () => {
        let align = null;
        let className = '';
        if (column.options?.alignCenter) {
          align = 'center';
        }
        if (column.options?.hideInSmallScreen)
          className += ' !hidden sm:!table-cell';
        return {
          ...(align && { align }),
          className,
        };
      };
    });
  });

  if (includeRowNumber)
    processed.unshift({
      name: 'S/N',
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (dataIndex) => dataIndex + 1,
        download: false,
      },
    });

  return processed;
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
          options={{ ...options, ...(props.options ?? {}) }}
        />
      </div>
    </ThemeProvider>
  );
};

DataTable.propTypes = MUIDataTable.propTypes;

/**
 * @deprecated `Use `lib/components/table` instead.
 */
export default DataTable;
