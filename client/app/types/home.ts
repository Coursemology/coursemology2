import { InstanceUserRoles } from './system/instance/users';
import { UserRoles } from './users';

interface HomeLayoutUserData {
  name: string;
  url: string;
  avatarUrl: string;
  role: UserRoles;
  instanceRole: InstanceUserRoles;
}

export interface HomeLayoutData {
  courses?: { title: string; url: string }[];
  user?: HomeLayoutUserData;
  signOutUrl?: string;
  masqueradeUserName?: string;
  stopMasqueradingUrl?: string;
}
