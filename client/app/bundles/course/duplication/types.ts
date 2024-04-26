export type DuplicableItemTypes =
  | 'ASSESSMENT'
  | 'TAB'
  | 'CATEGORY'
  | 'SURVEY'
  | 'ACHIEVEMENT'
  | 'FOLDER'
  | 'MATERIAL'
  | 'VIDEO'
  | 'VIDEO_TAB';

type DuplicationMode = 'OBJECT' | 'COURSE';

export interface Instance {
  id: number;
  name: string;
  host: string;
}

export interface Course {
  id: number;
  host: string;
  path: string;
  title: string;
  enabledComponents: string[];
}

export interface SourceCourse {
  id: number;
  title: string;
  start_at: string;
  enabledComponents: string[];
  unduplicableObjectTypes: string[];
  duplicationModesAllowed: string[];
}

export interface DestinationCourse {
  id: number;
  title: string;
  path: string;
  host: string;
  rootFolder: {
    subfolders: string[];
    materials: string[];
  };
  enabledComponents: string[];
  unduplicableObjectTypes: string[];
}

export interface Assessment {
  id: number;
  title: string;
  published: boolean;
}

export interface Tab {
  id: number;
  title: string;
  assessments: Assessment[];
}

export interface Category {
  id: number;
  title: string;
  tabs: Tab[];
}

export interface Survey {
  id: number;
  title: string;
  published: boolean;
}

export interface Video {
  id: number;
  title: string;
  published: boolean;
}

export interface VideoTab {
  id: number;
  title: string;
  videos: Video[];
}

export interface Achievement {
  id: number;
  title: string;
  published: boolean;
  url: string;
}

export interface Material {
  id: number;
  name: string;
}

export interface Folder {
  id: number;
  parent_id: number;
  name: string;
  subfolders: Folder[];
  materials: Material[];
}

export interface DuplicationState {
  confirmationOpen: boolean;
  selectedItems: Record<DuplicableItemTypes, Record<number, boolean>>;
  destinationInstanceId: number;
  destinationCourseId: number;
  destinationCourseTitle: number;
  destinationCourseStartAt: number;
  destinationCourses: Course[];
  destinationInstances: Instance[];
  duplicationMode: DuplicationMode;
  currentItemSelectorPanel: DuplicableItemTypes | null;

  metadata: {
    canDuplicateToAnotherInstance: boolean;
    currentInstanceId: number;
  };

  currentHost: string;
  currentCourseId: number;
  sourceCourse: SourceCourse;

  assessmentsComponent: Category[];
  surveyComponent: Survey[];
  achievementsComponent: Achievement[];
  materialsComponent: Folder[];
  videosComponent: VideoTab[];

  isLoading: boolean;
  isChangingCourse: boolean;
  isDuplicating: boolean;
  isDuplicationSuccess: boolean;
}
