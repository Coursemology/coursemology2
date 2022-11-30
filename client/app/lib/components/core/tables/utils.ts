import { CellTemplate, ColumnTemplate } from './types';

export const isCellTemplate = (
  data: CellTemplate | unknown,
): data is CellTemplate => (data as CellTemplate)?.content !== undefined;

export const normalizeCellTemplate = (
  cell: ColumnTemplate['header'] & ColumnTemplate['content'],
  template: ColumnTemplate<unknown>,
): CellTemplate => {
  if (isCellTemplate(cell)) return cell;

  return {
    content: cell,
    align: template.align,
    className: template.className,
  };
};
