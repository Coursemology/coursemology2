import { ReactNode } from 'react';

import { CellTemplate, ColumnTemplate, TableBuilder } from '../types';
import { isCellTemplate, normalizeCellTemplate } from '../utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = Record<string, any> | any[];

export type IterableColumnTemplate<D extends AnyData> = ColumnTemplate<
  ReactNode | CellTemplate | ((rowData: D) => CellTemplate | ReactNode)
>;

const iterableTableBuilderWith = <D extends AnyData>(
  data: D[],
): TableBuilder<IterableColumnTemplate<D>> => ({
  buildHeaderCells: (templates) =>
    templates.reduce<CellTemplate[]>((headerCells, template) => {
      if (template.renderIf === false) return headerCells;

      headerCells.push(normalizeCellTemplate(template.header, template));
      return headerCells;
    }, []),
  buildBodyCells: (templates) =>
    data.map((rowData) =>
      templates.reduce<CellTemplate[]>((cells, template) => {
        if (template.renderIf === false) return cells;

        const cell = template.content;
        if (isCellTemplate(cell)) {
          cells.push(cell);
        } else if (typeof cell === 'function') {
          cells.push(normalizeCellTemplate(cell(rowData), template));
        } else {
          cells.push({
            content: cell,
            align: template.align,
            className: template.className,
          });
        }

        return cells;
      }, []),
    ),
});

export default iterableTableBuilderWith;
