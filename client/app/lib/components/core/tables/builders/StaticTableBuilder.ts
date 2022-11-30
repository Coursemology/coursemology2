import { CellTemplate, TableBuilder } from '../types';
import { normalizeCellTemplate } from '../utils';

const staticTableBuilder: TableBuilder = {
  buildHeaderCells: (templates) =>
    templates.reduce<CellTemplate[]>((headerCells, template) => {
      if (!template.renderIf) return headerCells;

      headerCells.push(normalizeCellTemplate(template.header, template));
      return headerCells;
    }, []),
  buildBodyCells: (templates) =>
    templates.reduce<CellTemplate[][]>((cells, template) => {
      if (!template.renderIf) return cells;

      cells.push([normalizeCellTemplate(template.content, template)]);
      return cells;
    }, []),
};

export default staticTableBuilder;
