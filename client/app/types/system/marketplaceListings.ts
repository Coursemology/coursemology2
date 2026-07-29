/**
 * Marketplace VISIBILITY, and nothing else. The origin's fate is reported by `sourceAssessmentDeleted`
 * / `sourceCourseDeleted` instead of by an `orphaned` state value, because the two cross: a listing
 * whose source assessment was deleted is rebuilt into the marketplace container and goes on being
 * published, so one enum cannot carry both facts.
 */
export type MarketplaceListingState = 'published' | 'unlisted';

export interface MarketplaceListingAdminData {
  id: number;
  title: string | null;
  currentVersionPublishedAt: string | null;
  lastPublishedAt: string | null;
  adoptions: number;
  sourceCourseId: number | null;
  sourceCourseName: string | null;
  /**
   * The instance the source course belonged to. Null for listings that were already orphaned when
   * the column was introduced — there is nothing left on the row that identifies their origin.
   */
  sourceInstanceName: string | null;
  /** The origin instance's host: a course id only resolves there, never on the admin's own host. */
  sourceInstanceHost: string | null;
  /**
   * The origin course's teaching period, copied off its start/end dates at publish time so it
   * outlives the course. Raw timestamps — the client formats and sorts them.
   */
  sourceStartedAt: string | null;
  sourceEndedAt: string | null;
  state: MarketplaceListingState;
  /**
   * Whether the authoring copy lives in the marketplace's own container course rather than in a course
   * somebody owns — true after a rebuild, and for anything authored in the container directly.
   *
   * Orthogonal to `state`, which reports marketplace visibility. It is a separate field rather than a
   * fifth state value because the two axes cross: a marketplace-hosted listing can also be unlisted.
   * The provenance fields above keep naming the ORIGIN course after a rebuild, so this is the only
   * thing on the row that says where the copy an admin would edit actually is.
   */
  marketplaceHosted: boolean;
  /**
   * Whether the assessment this listing was published FROM has been deleted. Outlives the repair:
   * the authoring copy is rebuilt in the container, so this stays true while `state` reads
   * `published` — which is why it cannot be a state value.
   */
  sourceAssessmentDeleted: boolean;
  /** Whether the origin course has been deleted. Its denormalised name survives it. */
  sourceCourseDeleted: boolean;
  authoringAssessmentUrl: string | null;
}

export interface MarketplaceListingVersionData {
  /**
   * When this version's CONTENT was published, not when anyone copied it. This IS the version's
   * identity — there is no ordinal.
   */
  publishedAt: string | null;
  publisherName: string | null;
  isCurrent: boolean;
  /**
   * Absolute URL into the container course on the preview instance. Null when the snapshot no
   * longer resolves — a version row without a link rather than a broken one.
   */
  snapshotUrl: string | null;
}

export interface MarketplaceListingAdoptionData {
  id: number;
  destinationCourseId: number | null;
  destinationCourseName: string | null;
  /** Adopters span instances, and a course id only resolves on its own instance's host. */
  destinationCourseHost: string | null;
  adoptedVersionAt: string | null;
  adoptedAt: string | null;
  /** The snapshot of the version this course holds, so an admin can inspect what it actually got. */
  snapshotUrl: string | null;
}

/** Provenance, full version history and every adoption for one listing. Read-only. */
export interface MarketplaceListingDetailData {
  id: number;
  title: string | null;
  currentVersionPublishedAt: string | null;
  state: MarketplaceListingState;
  /** See `MarketplaceListingAdminData.marketplaceHosted`. */
  marketplaceHosted: boolean;
  /** See `MarketplaceListingAdminData.sourceAssessmentDeleted`. */
  sourceAssessmentDeleted: boolean;
  /** See `MarketplaceListingAdminData.sourceCourseDeleted`. */
  sourceCourseDeleted: boolean;
  /** Absolute url of the copy an admin would edit, or null while the listing has none. */
  authoringAssessmentUrl: string | null;
  sourceCourseId: number | null;
  sourceCourseName: string | null;
  sourceInstanceName: string | null;
  sourceInstanceHost: string | null;
  /** See `MarketplaceListingAdminData.sourceStartedAt`. */
  sourceStartedAt: string | null;
  sourceEndedAt: string | null;
  /** Ascending by publish date. Empty for a listing that has never been published. */
  versions: MarketplaceListingVersionData[];
  adoptions: MarketplaceListingAdoptionData[];
}
