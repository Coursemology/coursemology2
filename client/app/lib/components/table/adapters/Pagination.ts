interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pages?: number[];
  allowShowAll?: boolean;
  onPageChange?: (index: number) => void;
  onPageSizeChange?: (size: number) => void;
  showAllLabel?: string;
}

export default PaginationProps;
