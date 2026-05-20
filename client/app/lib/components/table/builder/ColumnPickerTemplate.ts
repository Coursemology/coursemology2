import { ReactNode } from 'react';

import { Data } from './ColumnTemplate';

export interface ColumnPickerRenderCtx {
  isVisible: (columnId: string) => boolean;
  setVisible: (columnId: string, value: boolean) => void;
  setManyVisible: (columnIds: string[], value: boolean) => void;
}

interface ColumnPickerTemplate<D extends Data> {
  /** Caller renders its own tree using the provided ctx helpers. */
  renderTree: (ctx: ColumnPickerRenderCtx) => ReactNode;

  /** Column ids that render disabled-checked. Forcibly kept visible on every commit. */
  locked?: string[];

  /** Toolbar button text, default "Export…". */
  triggerLabel?: string;

  /** Modal title, default "Select columns to export". */
  dialogTitle?: string;

  /**
   * `'csv'`: reuses the table's existing client-side CSV generator pipeline,
   *   respecting `csvDownloadable` and current visibility.
   *
   * Custom function: receives the *physical* table column ids currently visible.
   */
  onExport?: 'csv' | ((visibleIds: string[]) => void);

  /** CTA text, default "Export CSV". */
  exportLabel?: string;

  /** Whether `Export CSV` closes the dialog after firing. Default `true`. */
  closeOnExport?: boolean;
}

export default ColumnPickerTemplate;
