import { ReactNode } from 'react';

interface ToolbarProps {
  renderNative?: boolean;
  alternative?: {
    when: () => boolean;
    render: () => ReactNode;
  };
  csvDownload?: () => void;
  onSearchKeywordChange?: (keyword: string) => void;
  onDownloadCsv?: () => void;
  csvDownloadLabel?: string;
  searchPlaceholder?: string;
  buttons?: ReactNode[];
}

export default ToolbarProps;
