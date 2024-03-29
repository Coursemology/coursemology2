import { useMemo, useState } from 'react';

interface UseSearchHook<T> {
  searchedItems: T[];
  handleSearch: (query: string) => void;
  searchKeyword: string;
}

const useSearch = <T>(
  items: T[],
  searchKeys: (keyof T)[],
): UseSearchHook<T> => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const searchedItems = useMemo(() => {
    if (!searchKeyword) return items;

    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];

        return (
          typeof value === 'string' &&
          value.toLowerCase().includes(searchKeyword.toLowerCase().trim())
        );
      }),
    );
  }, [searchKeyword, items]);

  const handleSearch = (keyword: string): void => {
    const trimmedKeyword = keyword.trim();
    setSearchKeyword(trimmedKeyword);
  };

  return { searchedItems, handleSearch, searchKeyword };
};

export default useSearch;
