import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Updater,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import isEmpty from 'lodash-es/isEmpty';

import { useAppSelector } from 'lib/hooks/store';

import { RowEqualityData, TableProps } from '../adapters';
import { ColumnTemplate, TableTemplate } from '../builder';
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
  const userId = useAppSelector((state) => state.global.user.user.id);
  const rawStorageKey = props.columnPicker?.storageKey;
  const effectiveStorageKey =
    userId > 0 && rawStorageKey ? `${userId}:${rawStorageKey}` : undefined;

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

  const initialVisibility = useMemo<VisibilityState>(() => {
    let stored: VisibilityState | null = null;
    if (effectiveStorageKey) {
      try {
        const raw = localStorage.getItem(effectiveStorageKey);
        stored = raw ? (JSON.parse(raw) as VisibilityState) : null;
      } catch {
        stored = null;
      }
    }
    return Object.fromEntries(
      props.columns.map((c) => {
        const id = c.id ?? (c.of as string);
        const storedValue = stored?.[id];
        return [
          id,
          storedValue !== undefined ? storedValue : c.defaultVisible ?? true,
        ];
      }),
    );
  }, []);
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initialVisibility);

  // Ref-based so enforceLocked is stable and never a changing useEffect dep.
  const lockedRef = useRef(props.columnPicker?.locked);
  lockedRef.current = props.columnPicker?.locked;

  const enforceLocked = useCallback(
    (next: VisibilityState): VisibilityState => {
      const locked = lockedRef.current;
      if (!locked || locked.length === 0) return next;
      const enforced = { ...next };
      locked.forEach((id) => {
        enforced[id] = true;
      });
      return enforced;
    },
    [],
  );

  const safeSetVisibility = (updater: Updater<VisibilityState>): void => {
    setColumnVisibility((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return enforceLocked(next);
    });
  };

  useEffect(() => {
    if (!effectiveStorageKey) return;
    try {
      localStorage.setItem(
        effectiveStorageKey,
        JSON.stringify(columnVisibility),
      );
    } catch {
      // setItem throws QuotaExceededError (storage full) or SecurityError (private
      // browsing on some browsers). Persistence is best-effort; the current session
      // is unaffected if it fails.
    }
  }, [columnVisibility, effectiveStorageKey]);

  // Reconcile when columns change (e.g. async-loaded gradebook assessments).
  useEffect(() => {
    setColumnVisibility((prev) => {
      const currentIds = props.columns.map((c) => c.id ?? (c.of as string));
      const colMap = new Map(
        props.columns.map((c) => [c.id ?? (c.of as string), c]),
      );
      const next: VisibilityState = {};
      currentIds.forEach((id) => {
        next[id] = Object.hasOwn(prev, id)
          ? prev[id]
          : colMap.get(id)?.defaultVisible ?? true;
      });
      const enforced = enforceLocked(next);
      // Return prev reference when nothing changed — prevents infinite re-render
      // loop when columns/locked arrays are new references on every render.
      const changed =
        Object.keys(enforced).length !== Object.keys(prev).length ||
        Object.keys(enforced).some((k) => enforced[k] !== prev[k]);
      return changed ? enforced : prev;
    });
  }, [props.columns, enforceLocked]);

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
    // Search only matches columns that are currently visible ("search what you
    // see"): hiding a column via the picker removes it from search too, so no
    // result can appear without a visible column explaining it.
    //
    // We also bypass TanStack's default type-sniff here. The default
    // getColumnCanGlobalFilter inspects the first row's value type
    // (string|number) to decide participation; a nullable first value (e.g.
    // externalId=null) is typeof 'object' → false, silently excluding the
    // column even when searchable:true. Intent is already expressed via
    // enableGlobalFilter (= searchable), so visibility is the only extra gate.
    // See: https://github.com/TanStack/table/pull/6252
    getColumnCanGlobalFilter: (column) => column.getIsVisible(),
    autoResetPageIndex: false,
    state: {
      rowSelection,
      columnFilters,
      globalFilter: searchKeyword.trim(),
      pagination,
      columnVisibility,
    },
    onColumnVisibilityChange: safeSetVisibility,
    initialState: {
      sorting: props.sort?.initially && [
        {
          id: props.sort.initially.by,
          desc: props.sort.initially.order === 'desc',
        },
      ],
    },
  });

  const getRealColumnById = (id: string): ColumnTemplate<D> | undefined => {
    // Use the position within getAllLeafColumns() as the index into getRealColumn.
    // We cannot search table.options.columns by c.id (undefined for accessorKey-based columns),
    // and we cannot use col.columnDef reference equality because TanStack's createColumn spreads
    // the def ({ ...defaultColumn, ...columnDef }), so col.columnDef is never === the original.
    //
    // Why getAllLeafColumns() index === getRealColumn() index:
    //   table.options.columns (ColumnDef[])
    //     → _getColumnDefs() returns it directly
    //     → getAllColumns() maps each def → Column, preserving order
    //     → getAllLeafColumns() flatMaps + applies _getOrderColumnsFn
    //        (identity when columnOrder state is empty — we never set it)
    //        NOTE: if user-reorderable columns are added, columnOrder state will be set and
    //        getAllLeafColumns() will no longer match getRealColumn() by position. At that point
    //        getRealColumnById must be rewritten to look up by id rather than position.
    //   getRealColumn is built by buildColumns, which maps built-array position → ColumnTemplate
    //   using the same table.options.columns as input in the same order.
    //   Both arrays share the same positional index, so getRealColumn(i) matches getAllLeafColumns()[i].
    //
    // Visibility safety: getAllLeafColumns() includes hidden columns, so the index is stable
    // regardless of columnVisibility state. getVisibleLeafColumns() would shift indices and
    // break the mapping (the root cause of the bug fixed in PR #8226).
    const index = table.getAllLeafColumns().findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    return getRealColumn(index);
  };

  const generateAndDownloadCsv = async (): Promise<void> => {
    const csvData = await generateCsv({
      table,
      getRealColumn: getRealColumnById,
      getExtraHeaderRows: props.columnPicker?.getExtraHeaderRows,
      onlySelected: !isEmpty(rowSelection),
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
      // Use getRealColumnById (ID-based) not getRealColumn(index). getVisibleCells() skips hidden
      // columns, so its positional index diverges from getRealColumn's full-column-list index
      // whenever any column is hidden — the same misalignment fixed for CSV in PR #8226.
      forEachCell: (cell, row) => ({
        id: cell.id,
        render: customCellRender(cell),
        className: getRealColumnById(cell.column.id)?.className,
        colSpan: getRealColumnById(cell.column.id)?.colSpan?.(row.original),
        shouldNotRender: getRealColumnById(cell.column.id)?.cellUnless?.(
          row.original,
        ),
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
      selectedCount: table.getSelectedRowModel().rows.length,
      allFilteredSelected:
        table.getFilteredRowModel().rows.length > 0 &&
        table.getFilteredRowModel().rows.every((r) => r.getIsSelected()),
      someFilteredSelected: table
        .getFilteredRowModel()
        .rows.some((r) => r.getIsSelected()),
      toggleAllFiltered: (): void => {
        const filteredRows = table.getFilteredRowModel().rows;
        const allSelected = filteredRows.every((r) => r.getIsSelected());
        filteredRows.forEach((r) => r.toggleSelected(!allSelected));
      },
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
      onDownloadCsv:
        props.csvDownload && (props.csvDownload.showDownloadButton ?? true)
          ? generateAndDownloadCsv
          : undefined,
      csvDownloadLabel: props.csvDownload?.downloadButtonLabel,
      searchPlaceholder: props.search?.searchPlaceholder,
      buttons: props.toolbar?.buttons,
      columnPicker: props.columnPicker,
      getColumnVisibility: () => columnVisibility,
      commitColumnVisibility: (next) => safeSetVisibility(() => next),
      onDirectExport: props.columnPicker
        ? (): Promise<void> => generateAndDownloadCsv()
        : undefined,
    },
  };
};

export default useTanStackTableBuilder;
