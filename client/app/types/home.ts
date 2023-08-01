import { InstanceUserRoles } from './system/instance/users';
import { UserRoles } from './users';

interface HomeLayoutUserData {
  name: string;
  url: string;
  avatarUrl: string;
  role: UserRoles;
  instanceRole: InstanceUserRoles;
}

export interface HomeLayoutCourseData {
  id: number;
  title: string;
  url: string;
  logoUrl: string;
  lastActiveAt: string | null;
}

export interface HomeLayoutData {
  courses?: HomeLayoutCourseData[];
  user?: HomeLayoutUserData;
  signOutUrl?: string;
  masqueradeUserName?: string;
  stopMasqueradingUrl?: string;
}
