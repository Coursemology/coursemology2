interface UseSortHook<T> {
  sortedItems: T[];
}

const useSort = <T>(
  items: T[],
  sortFunc: (items: T[]) => T[],
): UseSortHook<T> => {
  const sortedItems = sortFunc(items);
  return { sortedItems };
};

export default useSort;
