import { useMemo, useState } from 'react';
import {
  Cell,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import isEmpty from 'lodash-es/isEmpty';

import { RowEqualityData, TableProps } from '../adapters';
import type { CellRender } from '../adapters/Body';
import { buildHeaderRows, TableTemplate } from '../builder';
import { downloadCsv } from '../utils';

import buildTanStackColumns, {
  INDEX_COL_WIDTH_PX,
  ROW_SELECTOR_ID,
  ROW_SELECTOR_WIDTH_PX,
} from './columnsBuilder';
import generateCsv from './csvGenerator';
import { customCellRender, customHeaderRender } from './customFlexRender';

type TanStackTableProps<D> = TableProps<Row<D>, Cell<D, unknown>>;

const useTanStackTableBuilder = <D extends object>(
  props: TableTemplate<D>,
): TanStackTableProps<D> => {
  const [columns, getRealColumn] = buildTanStackColumns(
    props.columns,
    props.indexing?.rowSelectable,
    props.indexing?.indices,
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageSize:
      props.pagination?.initialPageSize ??
      props.pagination?.rowsPerPage?.[0] ??
      10,
    pageIndex: props.pagination?.initialPageIndex ?? 0,
  });

  const resetPagination = (): void =>
    setPagination((current) => ({ ...current, pageIndex: 0 }));

  const table = useReactTable({
    data: props.data,
    columns,
    enableRowSelection:
      typeof props.indexing?.rowSelectable === 'function'
        ? (row): boolean =>
            (props.indexing!.rowSelectable as (datum: D) => boolean)(
              row.original,
            )
        : props.indexing?.rowSelectable,
    getRowId: props.getRowId,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: props.pagination && getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearchKeyword,
    onPaginationChange: (current) => {
      setPagination(current);
      if (props.pagination?.onPaginationChange) {
        const newValue =
          typeof current === 'function' ? current(pagination) : pagination;
        props.pagination.onPaginationChange(newValue, pagination);
      }
    },
    autoResetPageIndex: false,
    state: {
      rowSelection,
      columnFilters,
      globalFilter: searchKeyword.trim(),
      pagination,
    },
    initialState: {
      sorting: props.sort?.initially && [
        {
          id: props.sort.initially.by,
          desc: props.sort.initially.order === 'desc',
        },
      ],
    },
  });

  const generateAndDownloadCsv = async (): Promise<void> => {
    const headers = table.options.columns.reduce<string[]>(
      (acc, column, index) => {
        const header = column.header || column.id;
        if (header && (getRealColumn(index)?.csvDownloadable ?? false)) {
          acc.push(header as string);
        }
        return acc;
      },
      [],
    );

    const csvData = await generateCsv({
      headers,
      rows: () => table.getCoreRowModel().rows,
      getRealColumn,
    });

    downloadCsv(csvData, props.csvDownload?.filename);
  };

  const tsHeaders = table.getHeaderGroups()[0]?.headers;
  const tsOffset =
    (props.indexing?.indices ? 1 : 0) + (props.indexing?.rowSelectable ? 1 : 0);

  const activeColumns = props.columns.filter((c) => !c.unless);

  // Indexing columns (row selector, row indices) are prepended to TanStack's
  // column array at indices 0..tsOffset-1. Prepending them here as synthetic
  // left-pinned ColumnTemplates lets buildHeaderRows include them in the header
  // and account for their widths in computePinOffsets, so user-defined pinned
  // columns receive correct sticky offsets.
  const allColumnsForHeader = useMemo(() => {
    const indexingCols: typeof activeColumns = [];
    if (props.indexing?.indices)
      indexingCols.push({
        id: 'index',
        title: '',
        cell: () => null,
        pin: 'left',
        widthPx: INDEX_COL_WIDTH_PX,
      });
    if (props.indexing?.rowSelectable)
      indexingCols.push({
        id: ROW_SELECTOR_ID,
        title: '',
        cell: () => null,
        pin: 'left',
        widthPx: ROW_SELECTOR_WIDTH_PX,
      });
    return [...indexingCols, ...activeColumns];
  }, [props.indexing?.indices, props.indexing?.rowSelectable, activeColumns]);

  // Indexing widths in TanStack column order (same order as prepended above).
  const indexingWidths = useMemo(() => {
    const widths: number[] = [];
    if (props.indexing?.indices) widths.push(INDEX_COL_WIDTH_PX);
    if (props.indexing?.rowSelectable) widths.push(ROW_SELECTOR_WIDTH_PX);
    return widths;
  }, [props.indexing?.indices, props.indexing?.rowSelectable]);

  const headerRows = useMemo(
    () =>
      buildHeaderRows(allColumnsForHeader, (_column, originalIndex) => {
        // originalIndex maps directly to tsHeaders because allColumnsForHeader
        // already absorbs the tsOffset by prepending the indexing columns.
        const tsHeader = tsHeaders[originalIndex];
        return {
          id: tsHeader.id,
          render: customHeaderRender(tsHeader),
          className: getRealColumn(originalIndex)?.className,
          sorting: tsHeader.column.getCanSort()
            ? {
                sorted: Boolean(tsHeader.column.getIsSorted()),
                direction: tsHeader.column.getIsSorted() || undefined,
                onClickSort: tsHeader.column.getToggleSortingHandler(),
              }
            : undefined,
          filtering: tsHeader.column.getCanFilter()
            ? {
                filters: tsHeader.column.getFilterValue() as unknown[],
                uniqueFilterValues: Array.from(
                  tsHeader.column.getFacetedUniqueValues().keys(),
                ).sort(),
                getFilterLabel:
                  getRealColumn(originalIndex)?.filterProps?.getLabel,
                onAddFilter: (value): void => {
                  resetPagination();
                  tsHeader.column.setFilterValue((currentFilters?: unknown[]) =>
                    currentFilters?.filter((filter) => filter !== value),
                  );
                },
                onClearFilters: (): void => {
                  resetPagination();
                  tsHeader.column.setFilterValue(undefined);
                },
                onRemoveFilter: (value): void => {
                  resetPagination();
                  tsHeader.column.setFilterValue(
                    (currentFilters?: unknown[]) =>
                      currentFilters ? [...currentFilters, value] : [value],
                  );
                },
                tooltipLabel: props.filter?.tooltipLabel,
                clearFiltersLabel: props.filter?.clearFilterTooltipLabel,
              }
            : undefined,
        };
      }),
    // tsHeaders changes on sort/filter state; allColumnsForHeader is stable per render cycle
    [allColumnsForHeader, tsHeaders],
  );

  return {
    header: {
      rows: headerRows,
    },
    body: {
      rows: table.getRowModel().rows,
      getCells: (row) => row.getVisibleCells(),
      forEachCell: (cell, row, index): CellRender => {
        if (index < tsOffset) {
          return {
            id: cell.id,
            render: customCellRender(cell),
            pin: 'left',
            widthPx: indexingWidths[index],
          };
        }
        return {
          id: cell.id,
          render: customCellRender(cell),
          className: getRealColumn(index)?.className,
          colSpan: getRealColumn(index)?.colSpan?.(row.original),
          shouldNotRender: getRealColumn(index)?.cellUnless?.(row.original),
          pin: getRealColumn(index)?.pin,
          widthPx: getRealColumn(index)?.widthPx,
        };
      },
      forEachRow: (row) => ({
        id: row.id,
        className: props.getRowClassName?.(row.original),
        getEqualityData:
          props.getRowEqualityData &&
          ((): RowEqualityData => ({
            payload: props.getRowEqualityData?.(row.original),
            selected: rowSelection[row.id],
          })),
      }),
    },
    handles: {
      getPaginationState: () => pagination,
      getRowSelectionState: () => rowSelection,
    },
    pagination: props.pagination && {
      allowShowAll: props.pagination.showAllRows,
      page: table.getState().pagination.pageIndex,
      pages: props.pagination.rowsPerPage,
      total: table.getFilteredRowModel().rows.length,
      // TODO: Replace use(s) of tables with this feature with TanStack Virtual
      // https://tanstack.com/virtual/latest
      showTotalPlus: props.pagination.showTotalPlus,
      pageSize: table.getState().pagination.pageSize,
      onPageChange: (page): void => table.setPageIndex(page),
      onPageSizeChange: (size): void => table.setPageSize(size),
      showAllLabel: props.pagination.showAllRowsLabel,
    },
    toolbar: {
      renderNative: props.toolbar?.show,
      alternative: {
        when: () => !isEmpty(rowSelection),
        render: () =>
          props.toolbar?.activeToolbar?.(
            table.getSelectedRowModel().rows.map((row) => row.original),
          ),
        keepNative: props.toolbar?.keepNative ?? false,
      },
      searchKeyword,
      onSearchKeywordChange: setSearchKeyword,
      onDownloadCsv: props.csvDownload && generateAndDownloadCsv,
      csvDownloadLabel: props.csvDownload?.downloadButtonLabel,
      searchPlaceholder: props.search?.searchPlaceholder,
      buttons: props.toolbar?.buttons,
    },
    maxHeight: props.maxHeight,
  };
};

export default useTanStackTableBuilder;
