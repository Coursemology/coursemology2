import { createElement } from 'react';

import TableContainer from './TableContainer';
import {
  ColumnTemplate,
  TableBuilder,
  TableContainerProps,
  TableRenderer,
} from './types';

interface TableProps<
  T extends ColumnTemplate<unknown>,
  B extends TableBuilder<T>,
  R extends TableRenderer,
> extends TableContainerProps {
  templates: T[];
  with: B;
  to: R;
}

const Table = <
  T extends ColumnTemplate<unknown>,
  B extends TableBuilder<T>,
  R extends TableRenderer,
>(
  props: TableProps<T, B, R>,
): JSX.Element => {
  const { templates, with: builder, to: renderer } = props;

  const headerCells = builder.buildHeaderCells(templates);
  const bodyCells = builder.buildBodyCells(templates);

  const result = createElement(renderer, { headerCells, bodyCells });

  return <TableContainer {...props}>{result}</TableContainer>;
};

export default Table;
