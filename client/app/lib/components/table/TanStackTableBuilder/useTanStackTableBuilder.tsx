import { useState } from 'react';
import {
  Cell,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Header,
  Row,
  useReactTable,
} from '@tanstack/react-table';
import isEmpty from 'lodash-es/isEmpty';

import { RowEqualityData, TableProps } from '../adapters';
import { TableTemplate } from '../builder';
import { downloadCsv } from '../utils';

import buildTanStackColumns from './columnsBuilder';
import generateCsv from './csvGenerator';
import { customCellRender, customHeaderRender } from './customFlexRender';

type TanStackTableProps<D> = TableProps<
  Header<D, unknown>,
  Row<D>,
  Cell<D, unknown>
>;

const useTanStackTableBuilder = <D extends object>(
  props: TableTemplate<D>,
): TanStackTableProps<D> => {
  const [columns, getRealColumn, initialColumnsLength] = buildTanStackColumns(
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
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      rowSelection,
      columnFilters,
      globalFilter: searchKeyword.trim(),
      pagination,
      columnVisibility: Object.fromEntries(
        props.columns.map((column) => [
          column.of ?? column.title,
          !column.hidden,
        ]),
      ),
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
    const headers = table.options.columns
      .slice(initialColumnsLength)
      .reduce<string[]>((acc, column, index) => {
        const header = column.header || column.id;
        if (header && (getRealColumn(index)?.csvDownloadable ?? false)) {
          acc.push(header as string);
        }
        return acc;
      }, []);
    const csvData = await generateCsv({
      initialColumnsLength,
      headers,
      rows: () => table.getCoreRowModel().rows,
      getRealColumn,
    });

    downloadCsv(csvData, props.csvDownload?.filename);
  };

  return {
    header: {
      headers: table.getHeaderGroups()[0]?.headers,
      forEach: (header, index) => ({
        id: header.id,
        render: customHeaderRender(header),
        className: getRealColumn(index)?.className,
        sorting: header.column.getCanSort()
          ? {
              sorted: Boolean(header.column.getIsSorted()),
              direction: header.column.getIsSorted() || undefined,
              onClickSort: header.column.getToggleSortingHandler(),
            }
          : undefined,
        filtering: header.column.getCanFilter()
          ? {
              filters: header.column.getFilterValue() as unknown[],
              uniqueFilterValues: Array.from(
                header.column.getFacetedUniqueValues().keys(),
              ).sort(),
              getFilterLabel: getRealColumn(index)?.filterProps?.getLabel,
              onAddFilter: (value): void => {
                resetPagination();
                header.column.setFilterValue((currentFilters?: unknown[]) =>
                  currentFilters?.filter((filter) => filter !== value),
                );
              },
              onClearFilters: (): void => {
                resetPagination();
                header.column.setFilterValue(undefined);
              },
              onRemoveFilter: (value): void => {
                resetPagination();
                header.column.setFilterValue((currentFilters?: unknown[]) =>
                  currentFilters ? [...currentFilters, value] : [value],
                );
              },
              tooltipLabel: props.filter?.tooltipLabel,
              clearFiltersLabel: props.filter?.clearFilterTooltipLabel,
            }
          : undefined,
      }),
    },
    body: {
      rows: table.getRowModel().rows,
      getCells: (row) => row.getVisibleCells(),
      forEachCell: (cell, _, index) => ({
        id: cell.id,
        render: customCellRender(cell),
        className: getRealColumn(index)?.className,
      }),
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
    pagination: props.pagination && {
      allowShowAll: props.pagination.showAllRows,
      page: table.getState().pagination.pageIndex,
      pages: props.pagination.rowsPerPage,
      total: table.getFilteredRowModel().rows.length,
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
  };
};

export default useTanStackTableBuilder;
