import { defineMessages } from 'react-intl';
import { StorefrontOutlined } from '@mui/icons-material';
import { Chip, Tooltip, Typography } from '@mui/material';
import {
  MarketplaceListingAdminData,
  MarketplaceListingState,
} from 'types/system/marketplaceListings';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { PromptText } from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDate, formatLongDateTime } from 'lib/moment';

import MarketplaceListingVisibilityButton from '../buttons/MarketplaceListingVisibilityButton';
import MarketplaceRestoreAuthoringButton from '../buttons/MarketplaceRestoreAuthoringButton';

interface Props {
  listings: MarketplaceListingAdminData[];
  /** Permanent purge, not unlisting. Resolves once the list has been refetched. */
  onDelete: (id: number) => Promise<void>;
  onRestored: () => void;
  /** The reversible unlist/list flip, which changes `state` and with it what else the row offers. */
  onVisibilityChanged: () => void;
}

/**
 * Filter-menu bucket for a listing with no recorded source instance. Publishing always records one,
 * so a row lands here only once that instance is DELETED — the FK nullifies both the instance and the
 * source course, leaving the denormalised course name as the whole of the row's provenance. It is a
 * real bucket rather than an omission so an admin hunting a problem still sees those rows.
 */
const NO_INSTANCE = '';

/**
 * A filter facet, deliberately NOT a fifth `MarketplaceListingState`. Marketplace-hosted answers WHERE
 * the authoring copy lives, while the state values answer whether the listing is on the marketplace —
 * and the two cross, so a row contributes both to the State filter menu and matches either
 * independently. The value cannot collide with a real state.
 */
const MARKETPLACE_HOSTED = 'marketplace_hosted';

/**
 * The complement of `MARKETPLACE_HOSTED`, and a filter value only, not a chip, because it is the
 * ordinary state of the marketplace listings.
 */
const NOT_MARKETPLACE_HOSTED = 'not_marketplace_hosted';

/**
 * A filter facet for listings with no source assessment at all. Unlike the marketplace-hosted pair,
 * it is contributed ONLY by the rows it describes, so it appears in the menu just when something is
 * wrong: an orphan is not a state the system produces any more — losing a source assessment re-points
 * the listing inside the same transaction — so a value matching nothing on a healthy deployment would
 * advertise a fault as an ordinary way for a listing to be. It has no complement for the same reason.
 */
const ORPHANED = 'orphaned';

type StateFilterValue =
  | MarketplaceListingState
  | typeof MARKETPLACE_HOSTED
  | typeof NOT_MARKETPLACE_HOSTED
  | typeof ORPHANED;

const translations = defineMessages({
  colId: {
    id: 'system.admin.admin.MarketplaceListingsTable.colId',
    defaultMessage: 'ID',
  },
  colTitle: {
    id: 'system.admin.admin.MarketplaceListingsTable.colTitle',
    defaultMessage: 'Original assessment',
  },
  colSource: {
    id: 'system.admin.admin.MarketplaceListingsTable.colSource',
    defaultMessage: 'Source course',
  },
  colInstance: {
    id: 'system.admin.admin.MarketplaceListingsTable.colInstance',
    defaultMessage: 'Instance',
  },
  colVersion: {
    id: 'system.admin.admin.MarketplaceListingsTable.colVersion',
    defaultMessage: 'Version',
  },
  colAdoptions: {
    id: 'system.admin.admin.MarketplaceListingsTable.colAdoptions',
    defaultMessage: 'Adoptions',
  },
  colState: {
    id: 'system.admin.admin.MarketplaceListingsTable.colState',
    defaultMessage: 'State',
  },
  colActions: {
    id: 'system.admin.admin.MarketplaceListingsTable.colActions',
    defaultMessage: 'Actions',
  },
  statePublished: {
    id: 'system.admin.admin.MarketplaceListingsTable.statePublished',
    defaultMessage: 'Published',
  },
  stateUnlisted: {
    id: 'system.admin.admin.MarketplaceListingsTable.stateUnlisted',
    defaultMessage: 'Unlisted',
  },
  deletedSuffix: {
    id: 'system.admin.admin.MarketplaceListingsTable.deletedSuffix',
    defaultMessage: '(deleted)',
  },
  assessmentDeletedHint: {
    id: 'system.admin.admin.MarketplaceListingsTable.assessmentDeletedHint',
    defaultMessage:
      'The assessment this listing was originally published from has been deleted. The listing is unaffected: it goes on serving its last published version, and a source assessment is saved in the marketplace’s preview course so new versions can still be published.',
  },
  courseDeletedHint: {
    id: 'system.admin.admin.MarketplaceListingsTable.courseDeletedHint',
    defaultMessage:
      'The course this listing was published from has been deleted. Its name is kept as a record of where the content came from.',
  },
  marketplaceHosted: {
    id: 'system.admin.admin.MarketplaceListingsTable.marketplaceHosted',
    defaultMessage: 'Marketplace-hosted',
  },
  notMarketplaceHosted: {
    id: 'system.admin.admin.MarketplaceListingsTable.notMarketplaceHosted',
    defaultMessage: 'Not marketplace-hosted',
  },
  marketplaceHostedHint: {
    id: 'system.admin.admin.MarketplaceListingsTable.marketplaceHostedHint',
    defaultMessage:
      "This listing's source assessment lives in the marketplace's own preview course, not in the course it was originally published from - the original was deleted, so the marketplace saved one to keep publishing from.",
  },
  orphaned: {
    id: 'system.admin.admin.MarketplaceListingsTable.orphaned',
    defaultMessage: 'Orphaned',
  },
  // Names the fault AND the remedy: a chip reading "Orphaned" beside a Published listing otherwise
  // leaves an admin unable to tell whether the listing is serving, whether to act, or which action.
  orphanedHint: {
    id: 'system.admin.admin.MarketplaceListingsTable.orphanedHint',
    defaultMessage:
      'This listing has no source assessment, which should not happen: one is rebuilt automatically whenever an assessment or the course holding it is deleted. Rebuild it from the latest published version, or delete the listing if there is no version left to rebuild from.',
  },
  openSourceAssessment: {
    id: 'system.admin.admin.MarketplaceListingsTable.openSourceAssessment',
    defaultMessage: 'Open source assessment',
  },
  filterNoInstance: {
    id: 'system.admin.admin.MarketplaceListingsTable.filterNoInstance',
    defaultMessage: 'Instance not recorded',
  },
  searchText: {
    id: 'system.admin.admin.MarketplaceListingsTable.searchText',
    defaultMessage: 'Search listings by assessment title or source course',
  },
  emptyTitle: {
    id: 'system.admin.admin.MarketplaceListingsTable.emptyTitle',
    defaultMessage: 'No assessments have been published yet.',
  },
  unknown: {
    id: 'system.admin.admin.MarketplaceListingsTable.unknown',
    defaultMessage: '—',
  },
  deleteTitle: {
    id: 'system.admin.admin.MarketplaceListingsTable.deleteTitle',
    defaultMessage: 'Delete this listing permanently?',
  },
  deleteConfirm: {
    id: 'system.admin.admin.MarketplaceListingsTable.deleteConfirm',
    defaultMessage:
      'The listing, all of its versions and the snapshots those versions hold in the preview container will be deleted permanently. This cannot be undone. To merely take the listing off the marketplace, unlist it instead.',
  },
  deleteConfirmUnlisted: {
    id: 'system.admin.admin.MarketplaceListingsTable.deleteConfirmUnlisted',
    defaultMessage:
      'The listing, all of its versions and the snapshots those versions hold in the preview container will be deleted permanently. The source assessment is not affected and can be published again. This cannot be undone.',
  },
  deleteTooltip: {
    id: 'system.admin.admin.MarketplaceListingsTable.deleteTooltip',
    defaultMessage: 'Delete permanently',
  },
  deleteBlockedTooltip: {
    id: 'system.admin.admin.MarketplaceListingsTable.deleteBlockedTooltip',
    defaultMessage:
      'A published listing cannot be deleted. Unlist it first, so the reversible step comes before the irreversible one.',
  },
  deleteAdoptionWarning: {
    id: 'system.admin.admin.MarketplaceListingsTable.deleteAdoptionWarning',
    defaultMessage:
      '{count, plural, one {# course has} other {# courses have}} adopted this listing. Their existing copies will not be affected, but the adoption history will be destroyed.',
  },
});

const MarketplaceListingsTable = ({
  listings,
  onDelete,
  onRestored,
  onVisibilityChanged,
}: Props): JSX.Element => {
  const { t } = useTranslation();

  const stateDisplay: Record<MarketplaceListingState, string> = {
    published: t(translations.statePublished),
    unlisted: t(translations.stateUnlisted),
  };

  const stateColors = {
    published: 'success',
    unlisted: 'default',
  } as const;

  // Mirrors `Listing#orphaned?`, which is about the AUTHORING copy and not about the origin: a
  // rebuilt listing has a fresh copy in the container and is no longer orphaned, even though its
  // original source assessment is gone for good. The url is null exactly when the copy is missing.
  const isOrphaned = (listing: MarketplaceListingAdminData): boolean =>
    listing.authoringAssessmentUrl === null;

  // Mirrors `Listing#purgeable?`: a listing that is off the marketplace, orphaned or unlisted. A
  // published listing has to be unlisted first, which keeps the reversible step ahead of the
  // irreversible one. Adoption count plays no part — a deliberate deletion of an adopted listing is
  // allowed; the confirm dialog is where that fact is surfaced, not a disabled button.
  const isPurgeable = (listing: MarketplaceListingAdminData): boolean =>
    isOrphaned(listing) || listing.state === 'unlisted';

  // A deleted origin is struck through AND suffixed: the strikethrough carries at a glance, the
  // suffix carries for anyone who cannot see it, and the tooltip carries the part neither can — that
  // the listing itself is fine. "Deleted" beside a live, serving listing reads as "broken" without it.
  const deletedOrigin = (name: string, hint: string): JSX.Element => (
    <Tooltip title={hint}>
      <Typography color="text.secondary" component="span" variant="body2">
        <span className="line-through">{name}</span>{' '}
        {t(translations.deletedSuffix)}
      </Typography>
    </Tooltip>
  );

  const columns: ColumnTemplate<MarketplaceListingAdminData>[] = [
    {
      of: 'id',
      title: t(translations.colId),
      sortable: true,
      // The second entrance to the version history, and the only unconditional one. The Version cell
      // beside it links only when a version exists, so a listing that has never published one had no
      // route to its own page at all. Surfacing the id also gives the container's "Listing ID n"
      // chips something to resolve against.
      cell: (listing) => (
        <Link
          to={`/admin/marketplace_listings/${listing.id}`}
          underline="hover"
        >
          {listing.id}
        </Link>
      ),
    },
    {
      of: 'title',
      title: t(translations.colTitle),
      sortable: true,
      searchable: true,
      cell: (listing): JSX.Element | string => {
        const title = listing.title ?? t(translations.unknown);

        if (listing.sourceAssessmentDeleted)
          return deletedOrigin(title, t(translations.assessmentDeletedHint));

        return listing.authoringAssessmentUrl ? (
          <Link href={listing.authoringAssessmentUrl} underline="hover">
            {title}
          </Link>
        ) : (
          title
        );
      },
    },
    {
      id: 'source',
      title: t(translations.colSource),
      sortable: true,
      searchable: true,
      // Deliberately not filterable over courses.
      accessorFn: (listing) => listing.sourceCourseName ?? '',
      cell: (listing): JSX.Element | string => {
        const name = listing.sourceCourseName ?? t(translations.unknown);

        if (listing.sourceCourseDeleted)
          return deletedOrigin(name, t(translations.courseDeletedHint));

        return listing.sourceCourseId && listing.sourceInstanceHost ? (
          <Link
            href={`//${listing.sourceInstanceHost}/courses/${listing.sourceCourseId}/assessments`}
            underline="hover"
          >
            {listing.sourceCourseName ?? `#${listing.sourceCourseId}`}
          </Link>
        ) : (
          name
        );
      },
    },
    {
      id: 'instance',
      title: t(translations.colInstance),
      sortable: true,
      filterable: true,
      accessorFn: (listing) => listing.sourceInstanceName ?? '',
      filterProps: {
        getValue: (listing) => [listing.sourceInstanceName ?? NO_INSTANCE],
        getLabel: (value: string) =>
          value === NO_INSTANCE ? t(translations.filterNoInstance) : value,
        shouldInclude: (listing, filterValue?: string[]) =>
          !filterValue?.length ||
          filterValue.includes(listing.sourceInstanceName ?? NO_INSTANCE),
      },
      cell: (listing) =>
        listing.sourceInstanceName && listing.sourceInstanceHost ? (
          <Link href={`//${listing.sourceInstanceHost}/`} underline="hover">
            {listing.sourceInstanceName}
          </Link>
        ) : (
          listing.sourceInstanceName ?? t(translations.unknown)
        ),
    },
    {
      id: 'version',
      title: t(translations.colVersion),
      // The entrance to the version history, which is the only index into the container course.
      //
      // Date, not date+time: this table shows ONE version per listing, so there is no sibling to
      // disambiguate against and the time would be noise. It stays reachable on hover.
      cell: (listing) =>
        listing.currentVersionPublishedAt ? (
          <Tooltip
            describeChild
            disableInteractive
            title={formatLongDateTime(listing.currentVersionPublishedAt)}
          >
            <Link
              to={`/admin/marketplace_listings/${listing.id}`}
              underline="hover"
            >
              {formatLongDate(listing.currentVersionPublishedAt)}
            </Link>
          </Tooltip>
        ) : (
          t(translations.unknown)
        ),
    },
    {
      of: 'adoptions',
      title: t(translations.colAdoptions),
      sortable: true,
      sortProps: { sort: (a, b): number => a.adoptions - b.adoptions },
      cell: (listing) =>
        listing.adoptions > 0 ? (
          <Link
            to={`/admin/marketplace_listings/${listing.id}`}
            underline="hover"
          >
            {listing.adoptions}
          </Link>
        ) : (
          listing.adoptions.toString()
        ),
    },
    {
      of: 'state',
      title: t(translations.colState),
      filterable: true,
      filterProps: {
        // Every row contributes exactly one hosting value alongside its state, so the pair is always
        // both offered and complete — selecting neither is the same as selecting both. Orphaned is
        // contributed only by the rows it describes; see the constant.
        getValue: (listing) => [
          listing.state,
          listing.marketplaceHosted
            ? MARKETPLACE_HOSTED
            : NOT_MARKETPLACE_HOSTED,
          ...(isOrphaned(listing) ? [ORPHANED] : []),
        ],
        getLabel: (value: StateFilterValue): string => {
          if (value === MARKETPLACE_HOSTED)
            return t(translations.marketplaceHosted);
          if (value === NOT_MARKETPLACE_HOSTED)
            return t(translations.notMarketplaceHosted);
          if (value === ORPHANED) return t(translations.orphaned);

          return stateDisplay[value];
        },
        shouldInclude: (listing, filterValue?: StateFilterValue[]) =>
          !filterValue?.length ||
          filterValue.includes(listing.state) ||
          filterValue.includes(
            listing.marketplaceHosted
              ? MARKETPLACE_HOSTED
              : NOT_MARKETPLACE_HOSTED,
          ) ||
          (isOrphaned(listing) && filterValue.includes(ORPHANED)),
      },
      cell: (listing) => (
        <div className="flex flex-col items-start gap-0.5">
          <Chip
            color={stateColors[listing.state]}
            label={stateDisplay[listing.state]}
            size="small"
          />
          {/* Filled and in the alarm colour, unlike the marketplace-hosted marker beside it: that one
              is provenance, this one is a fault nothing but a bypassed callback can produce. The state
              chip stays as it is — an orphan goes on serving its last published version. */}
          {isOrphaned(listing) && (
            <Tooltip title={t(translations.orphanedHint)}>
              <Chip
                color="error"
                label={t(translations.orphaned)}
                size="small"
              />
            </Tooltip>
          )}
          {listing.marketplaceHosted && (
            <Tooltip title={t(translations.marketplaceHostedHint)}>
              <Chip
                label={t(translations.marketplaceHosted)}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      title: t(translations.colActions),
      cell: (listing) => (
        <div className="flex items-center gap-2">
          {listing.authoringAssessmentUrl && (
            <Link
              className="whitespace-nowrap"
              href={listing.authoringAssessmentUrl}
              underline="hover"
            >
              {t(translations.openSourceAssessment)}
            </Link>
          )}

          <MarketplaceListingVisibilityButton
            listing={listing}
            onChanged={onVisibilityChanged}
          />

          {isOrphaned(listing) &&
            listing.currentVersionPublishedAt !== null && (
              <MarketplaceRestoreAuthoringButton
                listing={listing}
                onRestored={onRestored}
              />
            )}

          <DeleteButton
            confirmMessage={
              <>
                <PromptText>
                  {isOrphaned(listing)
                    ? t(translations.deleteConfirm)
                    : t(translations.deleteConfirmUnlisted)}
                </PromptText>

                {listing.adoptions > 0 && (
                  <PromptText>
                    {t(translations.deleteAdoptionWarning, {
                      count: listing.adoptions,
                    })}
                  </PromptText>
                )}
              </>
            }
            disabled={!isPurgeable(listing)}
            onClick={(): Promise<void> => onDelete(listing.id)}
            title={t(translations.deleteTitle)}
            tooltip={
              isPurgeable(listing)
                ? t(translations.deleteTooltip)
                : t(translations.deleteBlockedTooltip)
            }
          />
        </div>
      ),
    },
  ];

  const emptyState = (
    <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
      <StorefrontOutlined sx={{ fontSize: '3rem', color: 'action.disabled' }} />

      <Typography color="text.secondary" variant="body2">
        {t(translations.emptyTitle)}
      </Typography>
    </div>
  );

  return (
    <Table
      columns={columns}
      data={listings}
      getRowId={(listing): string => listing.id.toString()}
      renderEmpty={emptyState}
      search={{ searchPlaceholder: t(translations.searchText) }}
      toolbar={{ show: true }}
    />
  );
};

export default MarketplaceListingsTable;
