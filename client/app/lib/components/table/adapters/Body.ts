import { ReactNode } from 'react';

import RowSelector from './RowSelector';

export interface RowEqualityData {
  payload: unknown;
  selected?: boolean;
}

export interface RowRender {
  id: string;
  className?: string;
  getEqualityData?: () => RowEqualityData;
}

export interface CellRender {
  id: string;
  render: ReactNode | RowSelector;
  className?: string;
  colSpan?: number;
  shouldNotRender?: boolean;
}

interface BodyProps<B, C> {
  rows: B[];
  getCells: (row: B) => C[];
  forEachCell: (cell: C, row: B, index: number) => CellRender;
  forEachRow: (row: B, index: number) => RowRender;
}

export default BodyProps;
