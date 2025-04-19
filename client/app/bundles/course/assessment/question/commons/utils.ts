import isNumber from 'lodash-es/isNumber';

const getNumberBetweenTwoSquareBrackets = (str: string): number | undefined => {
  const match = str.match(/\[(\d+)\]/);
  return match ? parseInt(match[1], 10) : undefined;
};

/**
 * Extracts the index and key from yup's `ValidationError` path. Only works
 * for first-level array-record paths of the format `'[index].key'`.
 *
 * @param path for example: `'[5].option'`
 * @returns a tuple of the index (`number`) and key (`string`)
 */
const getIndexAndKeyPath = <T extends string>(path: string): [number, T] => {
  const [indexString, key] = path.split('.');
  const index = getNumberBetweenTwoSquareBrackets(indexString);
  if (!isNumber(index))
    throw new Error(`validateOptions encountered ${index} index`);

  return [index, key as T];
};

export default getIndexAndKeyPath;
