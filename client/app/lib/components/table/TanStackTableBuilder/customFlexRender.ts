import { ReactNode } from 'react';
import { Cell, flexRender, Header } from '@tanstack/react-table';

import { RowSelector } from '../adapters';
import { Data } from '../builder';

import { ROW_SELECTOR_ID } from './columnsBuilder';

export const customCellRender = <D extends Data>(
  cell: Cell<D, unknown>,
): ReactNode | RowSelector => {
  const renderable = cell.column.columnDef.cell;
  const context = cell.getContext();

  if (cell.column.id === ROW_SELECTOR_ID) {
    if (typeof renderable === 'function') {
      return renderable(context) as RowSelector;
    }

    throw new Error('RowSelector renderer should be a function!');
  }

  return flexRender(renderable, context);
};

export const customHeaderRender = <D extends Data>(
  header: Header<D, unknown>,
): ReactNode | RowSelector => {
  const renderable = header.column.columnDef.header;
  const context = header.getContext();

  if (header.column.id === ROW_SELECTOR_ID) {
    if (typeof renderable === 'function') {
      return renderable(context) as RowSelector;
    }

    throw new Error('RowSelector renderer should be a function!');
  }

  return flexRender(renderable, context);
};
