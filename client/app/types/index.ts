/**
 * User or course user level permission types.
 */
export type Permissions<T extends string> = {
  [key in T]: boolean;
};

/**
 * Declare global types below.
 */
declare global {
  interface JQuery {
    sortable(var1?: any, var2?: any): any;
  }
}
