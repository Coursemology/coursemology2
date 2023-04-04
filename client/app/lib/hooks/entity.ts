import { Dispatch, SetStateAction, useMemo, useState } from 'react';

import translations from './translations';
import useTranslation, { MessageTranslator } from './useTranslation';

interface SearchResult<T> {
  filteredEntities: T[];
  handleSearchBarChange: (keyword: string) => void;
}

interface PaginateResult<T> {
  paginatedEntities: T[];
  slicedEntities: T[];
  page: number;
  itemsPerPage: number;
  setSlicedEntities: Dispatch<SetStateAction<T[]>>;
  setPage: Dispatch<SetStateAction<number>>;
}

interface Result<T> extends PaginateResult<T> {
  handleSearchBarChange: (keyword: string) => void;
}

export interface SortProps {
  name: string;
  elemType: string;
  order: string;
}

// const generateSortFunction = (props: SortProps):

export const useSearchEntities = <T extends Record<string, unknown>>(
  entities: T[],
  properties: string[],
  t: MessageTranslator,
): SearchResult<T> => {
  if (entities.length > 0) {
    if (properties.length === 0) {
      throw new Error(t(translations.emptyProperties));
    }

    const allKeysOfT = Object.keys(entities[0]) as (keyof T)[];
    if (!properties.every((p) => allKeysOfT.includes(p))) {
      throw new Error(t(translations.propsUndefined));
    }

    if (
      properties.some((prop) => {
        return typeof entities[0][prop] !== 'string';
      })
    ) {
      throw new Error(t(translations.filteringButNotStringType));
    }
  }

  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearchBarChange = (keyword: string): void => {
    const trimmedKeyword = keyword.trim();
    setSearchKeyword(trimmedKeyword);
  };

  const filteredEntities = useMemo(
    () =>
      searchKeyword === ''
        ? entities
        : entities.filter((entity: T) =>
            properties.some((prop) =>
              (entity[prop] as string)
                .toLowerCase()
                .includes(searchKeyword.toLowerCase()),
            ),
          ),
    [entities, searchKeyword],
  );

  return {
    filteredEntities,
    handleSearchBarChange,
  };
};

const generateSortFunction = <T>(
  type: string,
  name: string,
  order: 1 | -1,
): ((arg0: T, arg1: T) => number) | undefined => {
  if (type === 'date') {
    return (a: T, b: T) =>
      order * (Date.parse(b[name] as string) - Date.parse(a[name] as string));
  }

  if (type === 'string') {
    return (a: T, b: T) =>
      order * ((b[name] as string) > (a[name] as string) ? -1 : 1);
  }

  if (type === 'number') {
    return (a: T, b: T) => (b[name] as number) - (a[name] as number);
  }

  if (type === 'boolean') {
    return (a: T, b: T) =>
      order * (+(b[name] as boolean) - +(a[name] as boolean));
  }

  return undefined;
};

export const useSortEntities = <T extends Record<string, unknown>>(
  entities: T[],
  sortProps: SortProps[],
  t: MessageTranslator,
): T[] => {
  if (sortProps.length === 0) {
    throw new Error(t(translations.sortPropsEmpty));
  }

  if (entities.length > 0) {
    const sortPropsNames = sortProps.map((sp) => sp.name);
    const allKeysOfT = Object.keys(entities[0]) as (keyof T)[];
    if (!sortPropsNames.every((p) => allKeysOfT.includes(p))) {
      throw new Error(t(translations.propsUndefined));
    }
  } else {
    return entities;
  }

  const sortedEntities = [...entities];

  for (let i = 0; i < sortProps.length; i++) {
    const type = sortProps[i].elemType;
    const name = sortProps[i].name;
    const orderName = sortProps[i].order;

    if (!['date', 'string', 'boolean', 'number'].includes(type)) {
      throw new Error(t(translations.elemTypeNotYetSupported));
    }

    if (!['asc', 'desc'].includes(orderName)) {
      throw new Error(t(translations.orderNotDefinedProperly));
    }

    if (type === 'date') {
      const propsValue = entities[0][name];
      if (typeof propsValue !== 'string') {
        throw new Error(t(translations.sortDateButInputNotString));
      } else if (Number.isNaN(Date.parse(propsValue))) {
        throw new Error(t(translations.dateFormatInvalid));
      }
    } else if (type !== typeof entities[0][name]) {
      throw new Error(t(translations.mismatchWithElemType));
    }

    const order = sortProps[i].order === 'asc' ? 1 : -1;

    if (!generateSortFunction(type, name, order)) {
      throw new Error(t(translations.elemTypeNotYetSupported));
    }

    sortedEntities.sort(generateSortFunction(type, name, order));
  }

  return sortedEntities;
};

export const usePaginateEntities = <T extends Record<string, unknown>>(
  entities: T[],
  entitiesPerPage: number,
): PaginateResult<T> => {
  const [slicedEntities, setslicedEntities] = useState(
    entities.slice(0, entitiesPerPage),
  );
  const [page, setPage] = useState(1);

  return {
    paginatedEntities: entities,
    slicedEntities,
    page,
    itemsPerPage: entitiesPerPage,
    setSlicedEntities: setslicedEntities,
    setPage,
  };
};

export const useEntities = <T extends Record<string, unknown>>(
  entities: T[],
  entitiesPerPage: number,
  sortProps: SortProps[],
  searchProps: string[],
): Result<T> => {
  const { t } = useTranslation();
  const sortedEntities = useSortEntities<T>(entities, sortProps, t);
  const { filteredEntities, handleSearchBarChange } = useSearchEntities<T>(
    sortedEntities,
    searchProps,
    t,
  );
  const {
    paginatedEntities,
    slicedEntities,
    page,
    itemsPerPage,
    setSlicedEntities,
    setPage,
  } = usePaginateEntities(filteredEntities, entitiesPerPage);

  return {
    paginatedEntities,
    slicedEntities,
    page,
    handleSearchBarChange,
    itemsPerPage,
    setSlicedEntities,
    setPage,
  };
};
