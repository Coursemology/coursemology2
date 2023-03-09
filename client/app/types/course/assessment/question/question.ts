export type OptionalIfNew<T extends 'new' | 'edit'> = T extends 'new'
  ? undefined
  : never;
