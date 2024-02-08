import { InstanceUserRoles } from './system/instance/users';
import { UserRoles } from './users';

interface HomeLayoutUserData {
  id: number;
  name: string;
  primaryEmail: string;
  url: string;
  avatarUrl: string;
  role: UserRoles;
  instanceRole: InstanceUserRoles;
  canCreateNewCourse: boolean;
}

export interface HomeLayoutCourseData {
  id: number;
  title: string;
  url: string;
  logoUrl?: string;
  lastActiveAt: string | null;
}

export interface HomeLayoutData {
  locale: string;
  timeZone: string | null;
  courses?: HomeLayoutCourseData[];
  user?: HomeLayoutUserData;
}
