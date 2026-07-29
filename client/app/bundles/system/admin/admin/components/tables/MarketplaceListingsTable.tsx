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
 * Filter-menu bucket for a listing with no recorded source instance. Only listings that were already
 * orphaned when the column was introduced land here — the backfill had no source course to read the
 * instance off, and nothing else on the row identifies the origin. It is a real bucket rather than an
 * omission so an admin hunting a problem still sees those rows.
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
 * The complement of `MARKETPLACE_HOSTED`, and a filter value ONLY — never a chip, because it is the
 * ordinary state of the world (see the State cell). With only one of the pair selectable, "show me
 * the listings the marketplace does NOT maintain" was unaskable, which is the exact question an admin
 * auditing who-owns-what arrives with.
 *
 * Labelled as a NEGATION rather than given a name of its own ("course-hosted"): these values share a
 * menu with Published and Unlisted, and a second invented noun sitting beside two visibility states
 * reads as a third state. A negation cannot be misread that way, and it keeps the surface at one term.
 */
const NOT_MARKETPLACE_HOSTED = 'not_marketplace_hosted';

type StateFilterValue =
  | MarketplaceListingState
  | typeof MARKETPLACE_HOSTED
  | typeof NOT_MARKETPLACE_HOSTED;

const translations = defineMessages({
  colId: {
    id: 'system.admin.admin.MarketplaceListingsTable.colId',
    defaultMessage: 'ID',
  },
  // "Original", not "Source": the row carries both the assessment this listing was first published
  // from and the one it is published from now, and after a rebuild those differ. The Actions link
  // owns the live one as "source assessment"; this column owns the historical one, which is what
  // makes a struck-through cell literally true rather than a claim that the listing is broken.
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
  // The label stays the same on every row, including the marketplace-hosted ones. Where the source
  // assessment lives is already said twice on the row — by the Marketplace-hosted chip and by the
  // struck-through Original assessment cell — and a label that rewords itself per row reads as a
  // different action rather than the same one.
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

  // The State column answers ONE question — is this listing on the marketplace — so the chip label
  // and the filter label are the same words. Whether the origin still exists is a separate question,
  // answered in the two Source columns, because a listing can be published and have a deleted origin
  // at the same time.
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
      // This column and the one beside it describe the ORIGIN, so the link goes to the origin
      // assessment and nowhere else — the same ABSOLUTE cross-instance url the action uses, since a
      // course id resolves only on its own instance's host.
      //
      // Once the original is deleted the cell must NOT fall through to the authoring copy: after a
      // rebuild that copy is a different assessment in the marketplace container, and pointing a
      // column headed "Original assessment" at it would quietly claim the origin still exists. The
      // copy keeps its own entrance in Actions.
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
      // An explicit accessor is required because this column has no `of`: without one TanStack builds
      // a display column that can neither sort nor take part in search. It is the course NAME, so
      // searching "CS1010" narrows to that course's listings and sorting groups rows by origin.
      //
      // Deliberately NOT filterable: source courses number in the hundreds, most contributing one or
      // two listings, and the filter is client-side over the loaded rows — a course menu would only
      // grow as the feature succeeds. "Listings from CS1010" is a text query, not a set selection.
      accessorFn: (listing) => listing.sourceCourseName ?? '',
      // `//host/...`, not a relative path: `Course` is tenanted by instance, so a course id resolves
      // only on its own instance's host and a relative link 404s for every listing published from
      // another instance (same idiom as CoursesTable).
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
      // Just "Instance": adjacency to "Source course" already says whose instance it is, and the
      // column is narrow. It answers "*which* CS1010?" when two instances each have one.
      title: t(translations.colInstance),
      sortable: true,
      filterable: true,
      accessorFn: (listing) => listing.sourceInstanceName ?? '',
      // A filter rather than another searchable column: instances are a handful of stable values and
      // a natural slice for an admin auditing one deployment's contributions. Putting it on its own
      // header is what keeps the control honest — a filter menu of instance names hanging off the
      // "Source course" header would claim to filter one dimension while filtering another.
      filterProps: {
        getValue: (listing) => [listing.sourceInstanceName ?? NO_INSTANCE],
        getLabel: (value: string) =>
          value === NO_INSTANCE ? t(translations.filterNoInstance) : value,
        shouldInclude: (listing, filterValue?: string[]) =>
          !filterValue?.length ||
          filterValue.includes(listing.sourceInstanceName ?? NO_INSTANCE),
      },
      // Links to the instance's own landing page — `//host/`, protocol-relative for the same reason
      // the source-course link is: the instance is only reachable on its own host. Plain text when
      // the instance was never recorded, which is exactly the pre-column orphan case where there is
      // no host either.
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
      // The entrance to the version history, which is the ONLY index into the container course:
      // publishing copies the assessment title verbatim into one shared tab, so version identity
      // exists nowhere but the join table that page reads. An in-app route, so react-router `to`
      // rather than `href`.
      //
      // Date, not date+time: this table shows ONE version per listing, so there is no sibling to
      // disambiguate against and the time would be noise. It stays reachable on hover.
      //
      // `describeChild` because the full timestamp DESCRIBES this link, it does not name it. Without
      // it MUI puts the tooltip title on the child as `aria-label`, which replaces the link's
      // accessible name with the timestamp — leaving the link unreachable by its own visible text.
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
      // The shared builder hardcodes the 'alphanumeric' sorting function for every column, so an
      // explicit comparator is what guarantees 12 sorts above 9 rather than below it.
      sortProps: { sort: (a, b): number => a.adoptions - b.adoptions },
      // A count that raises "which courses?", and the listing page is where that list lives — so the
      // number itself carries the answer. Zero stays plain text: there is nothing to go and look at,
      // and the id beside it is already the unconditional entrance to the same page.
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
      // The menu carries both states AND the marketplace-hosted facet, because "show me the listings
      // the marketplace itself now maintains" is a question about this column that no state value can
      // express. A hosted row contributes two values, so it appears under its own state and under the
      // facet, and selecting the facet cuts across published and unlisted alike.
      filterProps: {
        // Every row contributes exactly one hosting value alongside its state, so the pair is always
        // both offered and complete — selecting neither is the same as selecting both.
        getValue: (listing) => [
          listing.state,
          listing.marketplaceHosted
            ? MARKETPLACE_HOSTED
            : NOT_MARKETPLACE_HOSTED,
        ],
        getLabel: (value: StateFilterValue): string => {
          if (value === MARKETPLACE_HOSTED)
            return t(translations.marketplaceHosted);
          if (value === NOT_MARKETPLACE_HOSTED)
            return t(translations.notMarketplaceHosted);

          return stateDisplay[value];
        },
        shouldInclude: (listing, filterValue?: StateFilterValue[]) =>
          !filterValue?.length ||
          filterValue.includes(listing.state) ||
          filterValue.includes(
            listing.marketplaceHosted
              ? MARKETPLACE_HOSTED
              : NOT_MARKETPLACE_HOSTED,
          ),
      },
      cell: (listing) => (
        <div className="flex flex-col items-start gap-0.5">
          <Chip
            color={stateColors[listing.state]}
            label={stateDisplay[listing.state]}
            size="small"
          />

          {/* Stacked beneath the state chip rather than replacing it: the row has to report both
              visibility and where its source assessment lives. Outlined rather than coloured, because
              this is provenance and not a health signal.

              Only the EXCEPTION is chipped. The opposite case — the source assessment still sitting in
              the course that published it — is the ordinary state of the world, and the Source course
              column two cells away already names that course and links to it, so a chip for it would
              restate a neighbour on nearly every row. It would also cost the marker its job: when
              every row is chipped, the one that needs an admin's attention stops standing out. The
              filter offers the complement as a NEGATION for the same reason — see the menu below. */}
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
      // One horizontal row of actions in a fixed order — open, list/unlist, restore, delete — so an
      // action always occupies the same slot regardless of how many the row offers. Every label is
      // `whitespace-nowrap`: a narrow Actions column must never break a label across lines.
      //
      // A listing with no authoring copy renders no open action at all rather than a disabled one:
      // there is nothing to open, and the rebuild action beside it says what to do instead.
      // List/unlist sits second because delete depends on it — unlisting is the reversible step that
      // has to precede a permanent deletion. Restore is orphaned-only and needs a version to copy.
      //
      // Delete is on every row, disabled rather than absent where the listing is still published, so
      // its tooltip can state the rule: unlist first. Adoption count gates nothing — a deliberate
      // deletion of an adopted listing must be allowed, and its confirm dialog surfaces that.
      cell: (listing) => (
        <div className="flex items-center gap-2">
          {listing.authoringAssessmentUrl && (
            // `href`, not react-router `to`: the server hands back an ABSOLUTE url carrying the
            // source course's own instance host, which only a full navigation can follow.
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
            // An unlisted listing keeps its source assessment, so the warning must not imply the
            // content is going with it — and it cannot advise unlisting something already unlisted.
            // The adoption warning layers on top of whichever of those applies, rather than
            // replacing it, because it is decision-relevant regardless of orphan/unlisted state.
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
            // The disabled tooltip carries the reason, not just the name of the action: a disabled
            // control that says only "Delete permanently" leaves the admin guessing. DeleteButton
            // wraps the button in a `span`, so the tooltip still fires while it is disabled.
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
