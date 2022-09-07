import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface EmailSettings {
  id: number;
  course_id: number;
  component:
    | 'announcements'
    | 'assessments'
    | 'forums'
    | 'surveys'
    | 'users'
    | 'videos';
  course_assessment_category_id?: number;
  setting:
    | 'new_announcement'
    | 'opening_reminder'
    | 'closing_reminder'
    | 'closing_reminder_summary'
    | 'grades_released'
    | 'new_comment'
    | 'new_submission'
    | 'new_topic'
    | 'post_replied'
    | 'new_enrol_request';
  phantom: boolean;
  regular: boolean;
  title?: string;
}

type NotificationSettingsState = EmailSettings[];

const initialState: NotificationSettingsState = [];

export const notificationSettingsSlice = createSlice({
  name: 'notificationSettings',
  initialState,
  reducers: {
    update: (_state, action: PayloadAction<NotificationSettingsState>) =>
      action.payload,
  },
});

export const { update } = notificationSettingsSlice.actions;

export default notificationSettingsSlice.reducer;
