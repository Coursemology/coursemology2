export interface GroupManager {
  id: number;
  name: string;
  nameLink: string;
}

export interface Student {
  id: number;
  name: string;
  nameLink: string;
  studentType: 'Phantom' | 'Normal';
  isMyStudent: boolean;
  groupManagers?: GroupManager[];
  level?: number;
  experiencePoints?: number;
  experiencePointsLink?: string;
  videoSubmissionCount?: number;
  videoSubmissionLink?: string;
  videoPercentWatched?: number;
}

export interface CourseStudent {
  id: number;
  name: string;
  nameLink: string;
  isPhantom: boolean;
  numSubmissions: number;
  correctness?: number;
  learningRate?: number;
  groupManagers?: GroupManager[];
  achievementCount?: number;
  level?: number;
  experiencePoints?: number;
  experiencePointsLink?: string;
  videoSubmissionCount?: number;
  videoSubmissionLink?: string;
  videoPercentWatched?: number;
}

export interface Metadata {
  isCourseGamified: boolean;
  showVideo: boolean;
  courseVideoCount: number;
  hasGroupManagers: boolean;
  hasMyStudents: boolean;
}

export interface StudentIndex {
  students: Student[];
  metadata: Metadata;
  isFetching: boolean;
  isError: boolean;
}

export interface StudentsStatisticsTable {
  students: Student[];
  metadata: Metadata;
}

export interface Staff {
  name: string;
  numGraded: number;
  numStudents: number;
  averageMarkingTime: string;
  stddev: string;
}

export interface StaffIndex {
  staff: Staff[];
  isFetching: boolean;
  isError: boolean;
}

export interface Assessment {
  id: number;
  title: string;
  startAt: string;
  endAt?: string;
}

interface SubmissionDetail {
  assessmentId: number;
  submittedAt: string;
}

export interface Submission {
  id: number;
  name: string;
  isPhantom: boolean;
  submissions: SubmissionDetail[];
}

interface CourseMetadata extends Omit<Metadata, 'hasMyStudents'> {
  hasPersonalizedTimeline: boolean;
  courseAchievementCount: number;
  courseAssessmentCount: number;
  maxLevel: number;
}

export interface CourseProgressionIndex {
  assessments: Assessment[];
  submissions: Submission[];
  isFetchingProgression: boolean;
  isErrorProgression: boolean;
}

export interface CoursePerformanceIndex {
  students: CourseStudent[];
  metadata: CourseMetadata;
  isFetchingPerformance: boolean;
  isErrorPerformance: boolean;
}

export interface StatisticsState {
  studentsStatistics: StudentIndex;
  staffStatistics: StaffIndex;
  courseProgressionStatistics: CourseProgressionIndex;
  coursePerformanceStatistics: CoursePerformanceIndex;
}
