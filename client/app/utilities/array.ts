type StringKeys<T> = {
  [K in keyof T]: T[K] extends string | number | symbol ? K : never;
}[keyof T];

export const arrayToObjectWithKey = <
  T extends Record<StringKeys<T>, string | number | symbol>,
  TKeyName extends keyof Record<StringKeys<T>, string | number | symbol>,
>(
  array: T[],
  key: TKeyName,
): Record<T[TKeyName], T> =>
  Object.fromEntries(array.map((a) => [a[key], a])) as Record<T[TKeyName], T>;
