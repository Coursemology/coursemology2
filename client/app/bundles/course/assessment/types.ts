import { CourseUserRoles } from 'types/course/courseUsers';

export interface CourseUserShape {
  id: number;
  name: string;
  role: CourseUserRoles;
  isPhantom: boolean;
}
