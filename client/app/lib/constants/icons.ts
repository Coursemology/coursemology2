import {
  Assistant,
  AssistantOutlined,
  Book,
  BookOutlined,
  Campaign,
  CampaignOutlined,
  ChatBubble,
  ChatBubbleOutlineOutlined,
  Circle,
  CircleOutlined,
  EmojiEvents,
  EmojiEventsOutlined,
  FileCopy,
  FileCopyOutlined,
  Folder,
  FolderOutlined,
  Forum,
  ForumOutlined,
  Groups,
  GroupsOutlined,
  Home,
  HomeOutlined,
  InsertChart,
  InsertChartOutlined,
  Leaderboard,
  LeaderboardOutlined,
  ManageAccounts,
  ManageAccountsOutlined,
  Map as MapIcon,
  MapOutlined,
  OfflineBolt,
  OfflineBoltOutlined,
  People,
  PeopleOutlined,
  PieChart,
  PieChartOutlined,
  Send,
  SendOutlined,
  Settings,
  SettingsOutlined,
  Stairs,
  StairsOutlined,
  Star,
  StarOutline,
  SvgIconComponent,
  Upload,
  UploadOutlined,
  Videocam,
  VideocamOutlined,
  ViewTimeline,
  ViewTimelineOutlined,
} from '@mui/icons-material';

interface IconTuple {
  outlined: SvgIconComponent;
  filled: SvgIconComponent;
}

export const COURSE_COMPONENT_ICONS = {
  achievement: { outlined: EmojiEventsOutlined, filled: EmojiEvents },
  assessment: { outlined: SendOutlined, filled: Send },
  material: { outlined: FolderOutlined, filled: Folder },
  survey: { outlined: PieChartOutlined, filled: PieChart },
  video: { outlined: VideocamOutlined, filled: Videocam },
  announcement: { outlined: CampaignOutlined, filled: Campaign },
  submission: { outlined: UploadOutlined, filled: Upload },
  comments: { outlined: ChatBubbleOutlineOutlined, filled: ChatBubble },
  leaderboard: { outlined: LeaderboardOutlined, filled: Leaderboard },
  users: { outlined: PeopleOutlined, filled: People },
  lessonPlan: { outlined: BookOutlined, filled: Book },
  forum: { outlined: ForumOutlined, filled: Forum },
  manageUsers: { outlined: ManageAccountsOutlined, filled: ManageAccounts },
  statistics: { outlined: InsertChartOutlined, filled: InsertChart },
  experience: { outlined: StarOutline, filled: Star },
  duplication: { outlined: FileCopyOutlined, filled: FileCopy },
  levels: { outlined: StairsOutlined, filled: Stairs },
  groups: { outlined: GroupsOutlined, filled: Groups },
  skills: { outlined: OfflineBoltOutlined, filled: OfflineBolt },
  timelines: { outlined: ViewTimelineOutlined, filled: ViewTimeline },
  settings: { outlined: SettingsOutlined, filled: Settings },
  home: { outlined: HomeOutlined, filled: Home },
  map: { outlined: MapOutlined, filled: MapIcon },
  stories: { outlined: AssistantOutlined, filled: Assistant },
} satisfies Record<string, IconTuple>;

export type CourseComponentIconName = keyof typeof COURSE_COMPONENT_ICONS;

const DEFAULT_ICON_TUPLE: IconTuple = {
  outlined: CircleOutlined,
  filled: Circle,
};

/**
 * Returns the `name` component's icon based on the `kind` variant. If the `name`
 * is unresolved during runtime, the default icon is returned.
 *
 * For some reasons, it's possible that `name` is unresolved. This bug was spotted
 * in CircleCI test runs. Accessing the `kind` by simply doing something like
 * `COURSE_COMPONENT_ICONS[name][kind]` is therefore unsafe and may result in fatal
 * error. This function is a defensive wrapper around the unsafe subscription.
 */
export const defensivelyGetIcon = (
  name: CourseComponentIconName,
  kind: keyof IconTuple = 'filled',
): SvgIconComponent => {
  const iconTuple = COURSE_COMPONENT_ICONS[name] ?? DEFAULT_ICON_TUPLE;
  return iconTuple[kind];
};
