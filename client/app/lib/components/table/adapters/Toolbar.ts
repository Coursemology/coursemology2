import { ReactNode } from 'react';

import { ColumnPickerTemplate, Data } from '../builder';

interface ToolbarProps<D extends Data = Data> {
  renderNative?: boolean;
  alternative?: {
    when: () => boolean;
    render: () => ReactNode;
    keepNative: boolean;
  };
  searchKeyword?: string;
  onSearchKeywordChange?: (keyword: string) => void;
  onDownloadCsv?: () => void;
  csvDownloadLabel?: string;
  searchPlaceholder?: string;
  buttons?: ReactNode[];

  /** Set when consumer passes `columnPicker` on TableTemplate. Drives Export… button + dialog. */
  columnPicker?: ColumnPickerTemplate<D>;
  /** Read-side accessor — called by the dialog to seed staged state. */
  getColumnVisibility?: () => Record<string, boolean>;
  /** Commit-side updater — called by the dialog on Apply / Export. */
  commitColumnVisibility?: (next: Record<string, boolean>) => void;
  /** Handler the dialog calls when user clicks Export CSV. Pre-bound to either 'csv' path or custom fn. */
  onExportFromPicker?: () => void;
}

export default ToolbarProps;
