import { UserBasicMiniEntity } from 'types/users';

export interface CourseListData {
  id: number;
  title: string;
  createdAt: string;
  activeUserCount: number;
  userCount: number;
  name: string;
  owners: UserBasicMiniEntity[];
}

export interface CourseMiniEntity {
  id: number;
  title: string;
  createdAt: string;
  activeUserCount: number;
  userCount: number;
  name: string;
  owners: UserBasicMiniEntity[];
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
}
