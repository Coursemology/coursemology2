import { UserBasicMiniEntity } from 'types/users';
import { InstanceMiniEntity } from './instances';

export interface CourseListData {
  id: number;
  title: string;
  createdAt: string;
  activeUserCount: number;
  userCount: number;
  instance: InstanceMiniEntity;
  owners: UserBasicMiniEntity[];
}

export interface CourseMiniEntity {
  id: number;
  title: string;
  createdAt: string;
  activeUserCount: number;
  userCount: number;
  instance: InstanceMiniEntity;
  owners: UserBasicMiniEntity[];
}

export interface CourseStats {
  totalCourses: number;
  activeCourses: number;
}
