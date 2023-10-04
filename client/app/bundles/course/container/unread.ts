import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UnreadState = Record<string, number>;

const initialState: UnreadState = {};

const unreadStore = createSlice({
  name: 'unread',
  initialState,
  reducers: {
    updateUnread: (state, action: PayloadAction<Record<string, number>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { updateUnread } = unreadStore.actions;

export default unreadStore.reducer;
