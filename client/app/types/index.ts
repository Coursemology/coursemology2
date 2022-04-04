/**
 * User or course user level permission types.
 */
export type Permissions<T extends string> = {
  [key in T]: boolean;
};

/**
 * Recursive array of type T (eg [1, 2, [1, 2]])
 */
export type RecursiveArray<T> = (T | RecursiveArray<T>)[];

/**
 * Declare global types below.
 */
declare global {
  interface JQuery {
    sortable(var1?: Object, var2?: Object): string;
  }
}
