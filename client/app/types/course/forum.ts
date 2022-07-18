/**
 * Data types for forum data sent to backend
 */
export interface ForumSearchParams {
  params: {
    ['search[course_user_id]']: number;
    ['search[start_time]']: Date;
    ['search[end_time]']: Date;
  };
}
