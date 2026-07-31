import { InstanceUserRoles } from './system/instance/users';
import { UserSystemRoles } from './users';

interface HomeLayoutUserData {
  id: number;
  name: string;
  primaryEmail: string;
  url: string;
  avatarUrl: string;
  role: UserSystemRoles;
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
  // Whether the marketplace sandbox's read-only lock applies to THIS viewer. The courseless
  // counterpart to `CourseLayoutData.isPreviewRestricted`, for shells that cannot read it off a
  // course. False for a system administrator, who curates the preview container from inside it.
  isPreviewRestricted?: boolean;
}
