// These are mirrored in app/helpers/course/object_duplications_helper.rb
export const DUPLICABLE_ITEM_TYPES = [
  'ASSESSMENT',
  'TAB',
  'CATEGORY',
  'SURVEY',
  'ACHIEVEMENT',
  'FOLDER',
  'MATERIAL',
  'VIDEO',
  'VIDEO_TAB',
] as const;

export type DuplicableItemType = (typeof DUPLICABLE_ITEM_TYPES)[number];

// These are mirrored in app/helpers/course/object_duplications_helper.rb
export const ITEM_SELECTOR_PANELS = [
  'ASSESSMENTS',
  'SURVEYS',
  'ACHIEVEMENTS',
  'MATERIALS',
  'VIDEOS',
] as const;

export type ItemSelectorPanel = (typeof ITEM_SELECTOR_PANELS)[number];

export const DUPLICATION_MODES = ['COURSE', 'OBJECT'] as const;

export type DuplicationMode = (typeof DUPLICATION_MODES)[number];

export interface DuplicationAchievementData {
  id: number;
  title: string;
  published: boolean;
  url: string;
}

export interface DuplicationCategoryData {
  id: number;
  title: string;
  tabs: {
    id: number;
    title: string;
    assessments: {
      id: number;
      title: string;
      published: boolean;
    }[];
  }[];
}
export type DuplicationTabData = DuplicationCategoryData['tabs'][number];
export type DuplicationAssessmentData =
  DuplicationTabData['assessments'][number];

export interface DuplicationFolderData {
  id: number;
  name: string;
  parent_id: number | null;
  materials: { id: number; name: string }[];
  subfolders: DuplicationFolderData[];
}
export type DuplicationMaterialData =
  DuplicationFolderData['materials'][number];

export interface DuplicationSurveyData {
  id: number;
  title: string;
  published: boolean;
}

export interface DuplicationVideoTabData {
  id: number;
  title: string;
  parent_id: number | null;
  videos: {
    id: number;
    title: string;
    published: boolean;
  }[];
}
export type DuplicationVideoData = DuplicationVideoTabData['videos'][number];

export interface CourseDuplicationData {
  sourceCourse: {
    id: number;
    title: string;
    start_at: string;
    duplicationModesAllowed: DuplicationMode[];
    enabledComponents: ItemSelectorPanel[];
    unduplicableObjectTypes: DuplicableItemType[];
  };
  achievementsComponent: DuplicationAchievementData[];
  assessmentsComponent: DuplicationCategoryData[];
  materialsComponent: DuplicationFolderData[];
  surveyComponent: DuplicationSurveyData[];
  videosComponent: DuplicationVideoTabData[];
}

export interface DuplicationInstanceListData {
  id: number;
  name: string;
  host: string;
}

export interface DuplicationData extends CourseDuplicationData {
  destinationCourses: {
    id: number;
    title: string;
    path: string;
    host: string;
    rootFolder: {
      subfolders: string[];
      materials: string[];
    };
    enabledComponents: ItemSelectorPanel[];
    unduplicableObjectTypes: DuplicableItemType[];
  }[];
  destinationInstances: DuplicationInstanceListData[];
  metadata: {
    currentInstanceId: number;
    currentInstanceHost: string;
  };
}

export interface DuplicationState
  extends Omit<DuplicationData, 'destinationInstances'> {
  confirmationOpen: boolean;
  selectedItems: Record<DuplicableItemType, Record<number, boolean>>;
  destinationCourseId: number | null;
  destinationInstances: Record<
    number,
    DuplicationInstanceListData & { weight: number }
  >;
  duplicationMode: DuplicationMode;
  currentHost: string;
  currentCourseId: number | null;
  currentItemSelectorPanel: ItemSelectorPanel | null;
  isLoading: boolean;
  isChangingCourse: boolean;
  isDuplicating: boolean;
  isDuplicationSuccess: boolean;
}
