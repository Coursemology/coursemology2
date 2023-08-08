export interface VideoSubmission {
  videoTitle: string;
  videoTabId: number;
  myStudentSubmissions: VideoSubmissionListData[] | [];
  studentSubmissions: VideoSubmissionListData[] | [];
  phantomStudentSubmissions: VideoSubmissionListData[] | [];
}

export interface VideoSubmissionListData {
  id?: number;
  createdAt?: string;
  percentWatched?: number;
  courseUserId: number;
  courseUserName: string;
  videoTitle?: string;
}

export interface VideoSubmissionData extends VideoSubmissionListData {
  videoTitle: string;
  videoDescription: string;
  videoStatistics?: {
    video: object;
    statistics: object;
  };
}

export interface VideoEditSubmissionData {
  videoTitle: string;
  videoDescription: string;
  videoData: object;
}

export interface VideoSubmissionAttemptData {
  submissionId: number;
}
