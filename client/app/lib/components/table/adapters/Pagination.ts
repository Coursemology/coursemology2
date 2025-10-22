interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  showTotalPlus?: boolean;
  pages?: number[];
  allowShowAll?: boolean;
  onPageChange?: (index: number) => void;
  onPageSizeChange?: (size: number) => void;
  showAllLabel?: string;
}

export default PaginationProps;
