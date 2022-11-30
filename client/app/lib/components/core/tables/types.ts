import { ReactNode } from 'react';

type Alignment = 'left' | 'right' | 'center' | 'justify';

export interface CellTemplate {
  content: ReactNode;
  align?: Alignment;
  className?: string;
}

export interface ColumnTemplate<C = CellTemplate> {
  content: ReactNode | C;
  header?: ReactNode | CellTemplate;
  align?: Alignment;
  renderIf?: boolean;
  className?: string;
}

export interface TableBuilder<
  T extends ColumnTemplate<unknown> = ColumnTemplate,
> {
  buildHeaderCells: (templates: T[]) => CellTemplate[];
  buildBodyCells: (templates: T[]) => CellTemplate[][];
}

interface TableRendererProps {
  headerCells: CellTemplate[];
  bodyCells: CellTemplate[][];
}

export type TableRenderer = (props: TableRendererProps) => JSX.Element;

type Variants = 'outlined' | 'elevation';

export interface TableContainerProps {
  className?: string;
  stickyHeader?: boolean;
  variant?: Variants;
  dense?: boolean;
}
