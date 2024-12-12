import { CourseUserRoles } from './course/courseUsers';

export type UserRoles = 'normal' | 'administrator';

export interface UserBasicListData {
  id: number;
  name: string;
  imageUrl?: string;
}
export interface UserListData {
  id: number;
  name: string;
  email: string;
  instances: {
    name: string;
    host: string;
  }[];
  role: UserRoles;
}

export interface UserBasicMiniEntity {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface UserMiniEntity extends UserBasicMiniEntity {
  email: string;
  instances: {
    name: string;
    host: string;
  }[];
  role: UserRoles;
}

export interface UserData extends UserBasicMiniEntity {
  userUrl?: string;
}

export interface UserCourseListData {
  id: number;
  title: string;
  enrolledAt: string;
  userCount: number;
  courseUserId: number;
  courseUserName: string;
  courseUserRole: CourseUserRoles;
  courseUserAchievement: number;
  courseUserLevel: number;
  type: string;
}

export interface UserCourseMiniEntity {
  id: number;
  title: string;
  enrolledAt: string;
  userCount: number;
  courseUserId: number;
  courseUserName: string;
  courseUserRole: CourseUserRoles;
  courseUserAchievement: number;
  courseUserLevel: number;
  type: string;
}

export interface AdminStats {
  totalUsers: {
    adminCount?: number;
    normalCount?: number;
    allCount: number;
  };
  activeUsers: {
    adminCount?: number;
    normalCount?: number;
    allCount: number;
  };
  coursesCount: number;
  usersCount: number;
  totalCourses: number;
  activeCourses: number;
  instancesCount: number;
}

export type Locale = 'en' | 'zh' | 'ko';

export interface ProfileData {
  id: string;
  name: string;
  timeZone: string;
  locale: string;
  imageUrl: string;
  availableLocales: Locale[];
}

export interface EmailData {
  id: number;
  email: string;
  isConfirmed: boolean;
  isPrimary: boolean;
  confirmationEmailPath?: string;
  setPrimaryUserEmailPath?: string;
}

export interface EmailsData {
  emails: EmailData[];
}

export interface PasswordData {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export interface ProfilePostData {
  user: {
    name?: ProfileData['name'];
    time_zone?: ProfileData['timeZone'];
    locale?: ProfileData['locale'];
    profile_photo?: ProfileData['imageUrl'];
  };
}

export interface EmailPostData {
  user_email: {
    email?: EmailData['email'];
  };
}

export interface PasswordPostData {
  user: {
    current_password?: PasswordData['currentPassword'];
    password?: PasswordData['password'];
    password_confirmation?: PasswordData['passwordConfirmation'];
  };
}

export interface InvitedSignUpData {
  name: string;
  email: string;
  courseTitle: string;
  courseId: string;
}
