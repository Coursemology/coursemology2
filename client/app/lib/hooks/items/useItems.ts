import usePaginate from './usePaginate';
import useSearch from './useSearch';
import useSort from './useSort';

interface UseItemsHook<T> {
  processedItems: T[];
  handleSearch: (query: string) => void;
  searchKeyword: string;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

const useItems = <T>(
  items: T[],
  searchKeys: (keyof T)[],
  sortFunc?: (itemsToSort: T[]) => T[],
  itemsPerPage?: number,
): UseItemsHook<T> => {
  const { searchedItems, handleSearch, searchKeyword } = useSearch(
    items,
    searchKeys,
  );
  const { sortedItems } = useSort(searchedItems, sortFunc);
  const { paginatedItems, currentPage, totalPages, handlePageChange } =
    usePaginate(sortedItems, itemsPerPage);

  const handleSearchAndPaginate = (keyword: string): void => {
    handleSearch(keyword);
    handlePageChange(1);
  };

  return {
    processedItems: paginatedItems,
    handleSearch: handleSearchAndPaginate,
    searchKeyword,
    currentPage,
    totalPages,
    handlePageChange,
  };
};

export default useItems;
