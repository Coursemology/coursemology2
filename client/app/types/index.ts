/**
 * User or course user level permission types.
 */
export type Permissions<T extends string> = {
  [key in T]: boolean;
};

/**
 * Recursive array of type T (eg [1, 2, [1, 2]])
 */
type Increment<A extends number[]> = [...A, 0];

export type RecursiveArray<
  T,
  Depth extends number = 10,
  CurrentDepth extends number[] = [],
> = Depth extends CurrentDepth['length']
  ? T
  : (T | RecursiveArray<T, Depth, Increment<CurrentDepth>>)[];

/**
 * Declare global types below.
 */
declare global {
  interface JQuery {
    sortable(var1?: Object, var2?: Object): string;
  }
}
