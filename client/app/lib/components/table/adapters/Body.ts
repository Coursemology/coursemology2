import { ReactNode } from 'react';

import RowSelector from './RowSelector';

interface RowRender {
  id: string;
  className?: string;
}

interface CellRender {
  id: string;
  render: ReactNode | RowSelector;
}

interface BodyProps<B, C> {
  rows: B[];
  getCells: (row: B) => C[];
  forEachCell: (cell: C, row: B, index: number) => CellRender;
  forEachRow: (row: B, index: number) => RowRender;
}

export default BodyProps;
