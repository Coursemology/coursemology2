import { CourseComponentIconName } from 'lib/constants/icons';

export interface SidebarItem {
  id: string;
  title?: string;
  weight: number;
  icon: CourseComponentIconName;
}

export type SidebarItems = SidebarItem[];

export interface SidebarItemsPostData {
  settings_sidebar: {
    sidebar_items_attributes: {
      id: SidebarItem['id'];
      weight: SidebarItem['weight'];
    }[];
  };
}
