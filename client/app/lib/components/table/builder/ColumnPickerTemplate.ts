import { ReactNode } from 'react';

export interface ColumnPickerRenderCtx {
  isVisible: (columnId: string) => boolean;
  setVisible: (columnId: string, value: boolean) => void;
  setManyVisible: (columnIds: string[], value: boolean) => void;
}

interface ColumnPickerTemplate {
  /** Caller renders its own tree using the provided ctx helpers. */
  renderTree: (ctx: ColumnPickerRenderCtx) => ReactNode;

  /** Column ids that render disabled-checked. Forcibly kept visible on every commit. */
  locked?: string[];

  /** At least one of these column ids must be selected to enable Apply/Export. */
  identifiers?: string[];

  /** Toolbar button text, default "Export…". */
  triggerLabel?: string;

  /** Modal title, default "Select columns to export". */
  dialogTitle?: string;

  /** Reuses the table's client-side CSV pipeline for the Export CSV button. */
  onExport: 'csv';

  /** CTA text, default "Export CSV". */
  exportLabel?: string;
}

export default ColumnPickerTemplate;
