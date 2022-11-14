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

export interface ColumnTemplate<RowData extends AnyRowData> {
  header?: CellData;
  content: (row: RowData) => CellData;
  align?: Alignment;
  hideColumnWhen?: boolean;
  className?: string;
}
