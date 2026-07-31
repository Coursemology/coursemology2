import { TimelineAlgorithm } from '../personalTimes';

import { QuestionType } from './question';
import type { QuestionData } from './questions';

export interface PersonalTimeData {
  isFixed: boolean;
  effectiveTime: string | null;
  referenceTime: string | null;
}

interface AssessmentActionsData {
  status: 'locked' | 'attempting' | 'submitted' | 'open' | 'unavailable';
  actionButtonUrl: string | null;
  monitoringUrl?: string;
  statisticsUrl?: string;
  plagiarismUrl?: string;
  submissionsUrl?: string;
  editUrl?: string;
  deleteUrl?: string;
}

export interface AchievementBadgeData {
  url: string;
  badgeUrl: string | null;
  title: string;
}

/**
 * Which marketplace listing a container-course assessment belongs to. Present only for a system
 * admin viewing the marketplace's container course — every assessment there keeps its original title
 * verbatim, so this is the only thing telling them apart.
 */
export interface MarketplaceVersionData {
  listingId: number;
  /** Null for the listing's editable working copy, which is not a version at all. */
  publishedAt: string | null;
  /** Denormalised at publish; survives deletion of the origin course, but may never have been set. */
  source: string | null;
  /**
   * Whether `Listing#current_version` points at this snapshot — the newest cut, not necessarily one
   * anybody can adopt. Always false for the working copy, which is not a version.
   */
  latest: boolean;
  /**
   * Whether the listing is on the marketplace (`Listing#published`), carried on every one of its
   * rows including the working copy. Combined with `latest` this is what distinguishes a version
   * being served from merely the newest one. True for a published orphan, which still serves.
   */
  listed: boolean;
  /**
   * Where to edit the content this snapshot froze. Present only on the show page, and only for a
   * snapshot — on the working copy the source assessment is the page you are already on. Null when
   * the listing is orphaned and its rebuilt copy has not landed. Absolute, because the source may
   * live on another instance.
   */
  sourceAssessmentUrl?: string | null;
}

export interface AssessmentListData extends AssessmentActionsData {
  id: number;
  title: string;
  passwordProtected: boolean;
  published: boolean;
  autograded: boolean;
  hasPersonalTimes: boolean;
  affectsPersonalTimes: boolean;
  url: string;
  conditionSatisfied: boolean;
  startAt: PersonalTimeData;
  timeLimit?: number;
  isStartTimeBegin: boolean;
  isKoditsuAssessmentEnabled?: boolean;
  marketplaceVersion?: MarketplaceVersionData;

  baseExp?: number;
  timeBonusExp?: number;
  bonusEndAt?: PersonalTimeData;
  endAt?: PersonalTimeData;
  hasTodo?: boolean;
  isBonusEnded?: boolean;
  isEndTimePassed?: boolean;
  remainingConditionalsCount?: number;
  topConditionals?: AchievementBadgeData[];
  submittedCount?: number;
}

export interface AssessmentsListData {
  display: {
    isStudent: boolean;
    isGamified: boolean;
    isKoditsuExamEnabled: boolean;
    timelineAlgorithm: TimelineAlgorithm;
    allowRandomization: boolean;
    isAchievementsEnabled: boolean;
    isMonitoringEnabled: boolean;
    bonusAttributes: boolean;
    endTimes: boolean;
    canCreateAssessments: boolean;
    tabId: number;
    tabTitle: string;
    tabUrl: string;
    canManageMonitor: boolean;
    /** True only in the marketplace's snapshot container, viewed by a system admin. */
    isMarketplaceContainer: boolean;
    category: {
      id: number;
      title: string;
      tabs: {
        id: number;
        title: string;
      }[];
    };
  };
  totalStudentCount?: number;
  assessments: AssessmentListData[];
}

interface NewQuestionBuilderData {
  type: keyof typeof QuestionType;
  url: string;
}

interface GenerateQuestionBuilderData {
  type: keyof typeof QuestionType;
  url: string;
}

export interface MarketplaceUpdateData {
  /**
   * When the content this copy was made from was published — its vintage, not the copy date. A
   * version IS its publication datetime; there is no ordinal anywhere in this payload.
   */
  adoptedVersionAt: string;
  /** When the version the marketplace currently serves was published. */
  latestVersionAt: string;
  /**
   * Whether this copy may be replaced in place. False as soon as any non-phantom student of the
   * course has a submission on it, in which case the banner offers no action at all. Advisory: the
   * endpoint re-checks before destroying anything.
   */
  canUpdateInPlace: boolean;
  /**
   * Staff and phantom test runs on this copy. They do not block the update, but it deletes them, so
   * the confirmation prompt names the number first.
   */
  testSubmissionCount: number;
}

export interface AssessmentData extends AssessmentActionsData {
  id: number;
  title: string;
  tabTitle: string;
  tabUrl: string;
  description: string;
  autograded: boolean;
  startAt: PersonalTimeData;
  hasAttempts: boolean;
  permissions: {
    canAttempt: boolean;
    canManage: boolean;
    canObserve: boolean;
    canInviteToKoditsu: boolean;
    canPublishToMarketplace: boolean;
  };
  isPublishedToMarketplace: boolean;
  marketplaceListingUrl: string;
  /** Null unless a newer version of the adopted marketplace listing is available. */
  marketplaceUpdate: MarketplaceUpdateData | null;
  /**
   * Present only for a system admin viewing an assessment the marketplace owns inside its container
   * course — a published snapshot or a listing's working copy. Same shape as the index row's badge.
   */
  marketplaceVersion?: MarketplaceVersionData;
  requirements: {
    title: string;
    satisfied?: boolean;
  }[];
  indexUrl: string;

  endAt?: PersonalTimeData;
  hasTodo?: boolean;
  timeLimit?: number;
  unlocks?: {
    description: string;
    title: string;
    url: string;
  }[];
  baseExp?: number;
  timeBonusExp?: number;
  bonusEndAt?: PersonalTimeData;
  willStartAt?: string;
  materialsDisabled?: boolean;
  componentsSettingsUrl?: string;
  files?: {
    id: number;
    name: string;
    url?: string;
  }[];

  liveFeedbackEnabled?: boolean;
  isKoditsuAssessmentEnabled?: boolean;
  isSyncedWithKoditsu?: boolean;
  isStudent: boolean;
  showMcqMrqSolution?: boolean;
  showRubricToStudents?: boolean;
  gradedTestCases?: string;
  skippable?: boolean;
  allowPartialSubmission?: boolean;
  showMcqAnswer?: boolean;
  hasUnautogradableQuestions?: boolean;
  questions?: QuestionData[];
  newQuestionUrls?: NewQuestionBuilderData[];
  generateQuestionUrls?: GenerateQuestionBuilderData[];
}

/**
 * What `show` renders for a breadcrumb request, and the subset every one of the three full variants
 * below opens with — so a crumb consumer reads the same fields whichever the backend falls through to
 * (view-password locked, monitor-blocked, or accessible).
 */
export interface AssessmentCrumbData {
  id: number;
  title: string;
  tabTitle: string;
  tabUrl: string;
}

export interface UnauthenticatedAssessmentData {
  id: number;
  title: string;
  tabTitle: string;
  tabUrl: string;
  isAuthenticated: false;
  isStartTimeBegin: boolean;
  startAt: string;
}

export interface BlockedByMonitorAssessmentData {
  id: number;
  title: string;
  tabTitle: string;
  tabUrl: string;
  blocked: true;
}

export type FetchAssessmentData =
  | AssessmentData
  | UnauthenticatedAssessmentData
  | BlockedByMonitorAssessmentData;

export interface AssessmentDeleteResult {
  redirect: string;
}

export interface QuestionOrderPostData {
  question_order: QuestionData['id'][];
}

export type AssessmentUnlockRequirements = string[];

export interface AssessmentAuthenticationFormData {
  password: string;
}

export const isAuthenticatedAssessmentData = (
  data: FetchAssessmentData,
): data is AssessmentData =>
  (data as AssessmentData)?.permissions !== undefined;

export const isUnauthenticatedAssessmentData = (
  data: FetchAssessmentData,
): data is UnauthenticatedAssessmentData =>
  (data as UnauthenticatedAssessmentData)?.isAuthenticated !== undefined;

export const isBlockedByMonitorAssessmentData = (
  data: FetchAssessmentData,
): data is BlockedByMonitorAssessmentData =>
  (data as BlockedByMonitorAssessmentData)?.blocked === true;
