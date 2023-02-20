import { ReactNode } from 'react';

interface CustomCellData {
  render: ReactNode;
  className?: string;
}

export type CellData = CustomCellData | ReactNode;
export type Alignment = 'left' | 'right' | 'center' | 'justify';

export const isCustomCell = (cell: CellData): cell is CustomCellData =>
  (cell as CustomCellData)?.render !== undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRowData = Record<string, any> | any[];

/**
 * @deprecated Use `lib/components/table` instead.
 */
export interface ColumnTemplate<RowData extends AnyRowData> {
  header?: CellData;
  content: (row: RowData) => CellData;
  align?: Alignment;
  hideColumnWhen?: boolean;
  className?: string;
}

type Variants = 'outlined' | 'elevation' | 'bare';

export interface TableContainerProps {
  className?: string;
  stickyHeader?: boolean;
  variant?: Variants;
  dense?: boolean;
}

interface AnyTableProps<RowData extends AnyRowData>
  extends TableContainerProps {
  data: RowData[];
  children: ColumnTemplate<RowData>[];
  rowKey: (row: RowData) => string;
  rowClassName?: string | ((row: RowData) => string);
  headerClassName?: string;
}

export type AnyTable = <RowData extends AnyRowData>(
  props: AnyTableProps<RowData>,
) => JSX.Element;
