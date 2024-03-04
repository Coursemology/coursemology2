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
  isTopStudent?: boolean;
  isBottomStudent?: boolean;
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

export interface StudentsStatistics {
  students: Student[];
  metadata: Metadata;
}

export interface Staff {
  id: number;
  name: string;
  numGraded: number;
  numStudents: number;
  averageMarkingTime: string;
  stddev: string;
}

export interface StaffStatistics {
  staff: Staff[];
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
export interface CourseProgressionStatistics {
  assessments: Assessment[];
  submissions: Submission[];
}

export interface CoursePerformanceStatistics {
  students: CourseStudent[];
  metadata: CourseMetadata;
}
