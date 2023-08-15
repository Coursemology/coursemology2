interface UseSortHook<T> {
  sortedItems: T[];
}

const useSort = <T>(
  items: T[],
  sortFunc?: (items: T[]) => T[],
): UseSortHook<T> => {
  if (!sortFunc) return { sortedItems: items };
  const sortedItems = sortFunc(items);
  return { sortedItems };
};

export default useSort;
