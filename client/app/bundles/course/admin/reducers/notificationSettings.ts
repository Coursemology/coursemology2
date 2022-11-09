import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { NotificationSettings } from 'types/course/admin/notifications';

const initialState: NotificationSettings = [];

export const notificationSettingsSlice = createSlice({
  name: 'notificationSettings',
  initialState,
  reducers: {
    update: (_state, action: PayloadAction<NotificationSettings>) =>
      action.payload,
  },
});

export const { update } = notificationSettingsSlice.actions;

export default notificationSettingsSlice.reducer;
