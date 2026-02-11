import ColumnTemplate, { Data } from './ColumnTemplate';

type TemplateAccessor<D extends Data> = (
  builtColumnIndex: number,
) => ColumnTemplate<D> | undefined;

export type BuiltColumns<D extends Data, C> = [C[], TemplateAccessor<D>];

export const buildColumns = <D extends Data, C>(
  columns: ColumnTemplate<D>[],
  getColumn: (column: ColumnTemplate<D>) => C,
  initial: C[] = [],
): BuiltColumns<D, C> => {
  const defToColumns: Record<number, ColumnTemplate<D>> = {};

  const defColumns = columns.reduce<C[]>((columnDefs, column) => {
    if (column.unless) return columnDefs;

    columnDefs.push(getColumn(column));

    defToColumns[columnDefs.length - 1] = column;

    return columnDefs;
  }, initial);

  return [defColumns, (index): ColumnTemplate<D> => defToColumns[index]];
};
