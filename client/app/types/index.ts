/**
 * User or course user level permission types.
 */
export type Permissions<T extends string> = {
  [key in T]: boolean;
};

/**
 * User or course user role types.
 */
export type Roles<T extends string> = {
  [key in T]: string;
};

/**
 * Declare global types below.
 */
declare global {
  interface JQuery {
    sortable(var1?: Object, var2?: Object): string;
  }
}
