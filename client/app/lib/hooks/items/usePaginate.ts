import { useMemo, useState } from 'react';

interface UsePaginateHook<T> {
  paginatedItems: T[];
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

const usePaginate = <T>(
  items: T[],
  itemsPerPage: number = items.length,
): UsePaginateHook<T> => {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedItems = useMemo(() => {
    return items.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [items, itemsPerPage, currentPage]);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };
  return { paginatedItems, totalPages, currentPage, handlePageChange };
};

export default usePaginate;
