/**
 * Data types for video submission data retrieved from backend through API call.
 */

export interface VideoSubmissionListData {
  id: string;
  title: string;
  videoSubmissionUrl: string;
  createdAt: string;
  percentWatched: number;
}
