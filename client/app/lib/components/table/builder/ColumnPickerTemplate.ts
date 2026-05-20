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

  /** Toolbar trigger button text, default "Export…". Opens the picker dialog. */
  triggerLabel?: string;

  /** Label for the direct-export button rendered next to the trigger in the toolbar. */
  directExportLabel?: string;

  /** Tooltip shown on the direct-export button. */
  directExportTooltip?: string;

  /** Modal title, default "Select columns to export". */
  dialogTitle?: string;

  /** Reuses the table's client-side CSV pipeline for the Export CSV button. */
  onExport: 'csv';

  /** CTA text inside the dialog, default "Apply and Export". */
  exportLabel?: string;

  /**
   * Called at CSV export time with the ordered visible column IDs.
   * Return one array per extra row to insert after the header row.
   */
  getExtraHeaderRows?: (columnIds: string[]) => string[][];

  /**
   * localStorage key for persisting column visibility across page loads.
   * When set, visibility is read from storage on mount and written on every change.
   */
  storageKey?: string;

  /**
   * Column ids that count as "data" columns (e.g. grade/gamification columns).
   * When provided and none of these ids are visible in the staged selection,
   * `noDataColumnsHint` is shown above the dialog actions.
   */
  dataColumnIds?: string[];

  /**
   * Hint shown above the dialog actions when no `dataColumnIds` are selected.
   * Has no effect if `dataColumnIds` is not provided.
   */
  noDataColumnsHint?: string;
}

export default ColumnPickerTemplate;
