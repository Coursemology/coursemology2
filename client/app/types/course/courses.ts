export interface Request {
  id: number;
  instance_id: number;
  user_id: number;
  role: string;
  organization: string;
  designation: string;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface CoursesPermissions {
  canCreate: boolean;
  requestSubmitted: Request | null;
}

export interface CoursesListPermissions {
  canCreate: boolean;
  requestSubmitted: Request | null;
}

export interface CoursesEntity {
  id: number;
  title: string;
  description: string;
  course: string;
  logo: string;
}

export interface CoursesListData {
  id: number;
  title: string;
  description: string;
  course: string;
  logo: string;
  permissions: CoursesListPermissions;
}

export interface NewCourseFormData {
  title: string;
  description: string;
}
