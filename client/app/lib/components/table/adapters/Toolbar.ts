import { ReactNode } from 'react';

import { ColumnPickerTemplate } from '../builder';

interface ToolbarProps {
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

  /** Set when consumer passes `columnPicker` on TableTemplate. Drives "Select Columns" button + dialog. */
  columnPicker?: ColumnPickerTemplate;
  /** Read-side accessor — called by the dialog to seed staged state. */
  getColumnVisibility?: () => Record<string, boolean>;
  /** Commit-side updater — called by the dialog on Apply / Export. */
  commitColumnVisibility?: (next: Record<string, boolean>) => void;
  /** Called when the user clicks "Apply and Export" in the dialog. Pre-bound to the CSV pipeline. */
  onExportFromPicker?: (visibility: Record<string, boolean>) => void;
  /** Called when the user clicks the direct Export button in the toolbar. Uses committed visibility. */
  onDirectExport?: () => Promise<void>;
}

export default ToolbarProps;
