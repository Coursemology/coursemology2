// Matches the submission bundle's legacy action types (see ../constants). Those actions are dispatched by the
// bundle's thunks rather than by the slices that react to them, so slices match them by type in extraReducers
// rather than handling them as their own reducers.
export const isOneOf =
  <A extends { type: string }>(...types: string[]) =>
  (action: { type: string }): action is A =>
    types.includes(action.type);
