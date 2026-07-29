import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MarketplaceListingDetailData,
  MarketplaceListingState,
} from 'types/system/marketplaceListings';

import SystemAPI from 'api/system';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

const translations = defineMessages({
  header: {
    id: 'system.admin.admin.MarketplaceListingShow.header',
    defaultMessage: 'Marketplace Listing',
  },
  fetchFailure: {
    id: 'system.admin.admin.MarketplaceListingShow.fetchFailure',
    defaultMessage: 'Failed to load this marketplace listing.',
  },
  sourceCourse: {
    id: 'system.admin.admin.MarketplaceListingShow.sourceCourse',
    defaultMessage: 'Source course',
  },
  instance: {
    id: 'system.admin.admin.MarketplaceListingShow.instance',
    defaultMessage: 'Instance',
  },
  versionHistory: {
    id: 'system.admin.admin.MarketplaceListingShow.versionHistory',
    defaultMessage: 'Version history',
  },
  colVersion: {
    id: 'system.admin.admin.MarketplaceListingShow.colVersion',
    defaultMessage: 'Version',
  },
  colPublisher: {
    id: 'system.admin.admin.MarketplaceListingShow.colPublisher',
    defaultMessage: 'Published by',
  },
  colContent: {
    id: 'system.admin.admin.MarketplaceListingShow.colContent',
    defaultMessage: 'Content',
  },
  viewVersion: {
    id: 'system.admin.admin.MarketplaceListingShow.viewVersion',
    defaultMessage: 'View {version} content',
  },
  // "Latest", matching the container's chip and the `apply_latest_version` route. The message id is
  // left alone: renaming it would orphan the key in every locale file for a copy change.
  currentBadge: {
    id: 'system.admin.admin.MarketplaceListingShow.currentBadge',
    defaultMessage: 'Latest',
  },
  noVersions: {
    id: 'system.admin.admin.MarketplaceListingShow.noVersions',
    defaultMessage: 'No versions have been published yet.',
  },
  adoptions: {
    id: 'system.admin.admin.MarketplaceListingShow.adoptions',
    defaultMessage: 'Adoptions',
  },
  colCourse: {
    id: 'system.admin.admin.MarketplaceListingShow.colCourse',
    defaultMessage: 'Course',
  },
  colVersionHeld: {
    id: 'system.admin.admin.MarketplaceListingShow.colVersionHeld',
    defaultMessage: 'Version held',
  },
  colAdoptedAt: {
    id: 'system.admin.admin.MarketplaceListingShow.colAdoptedAt',
    defaultMessage: 'Adopted',
  },
  noAdoptions: {
    id: 'system.admin.admin.MarketplaceListingShow.noAdoptions',
    defaultMessage: 'No courses have adopted this listing yet.',
  },
  statePublished: {
    id: 'system.admin.admin.MarketplaceListingShow.statePublished',
    defaultMessage: 'Published',
  },
  stateUnlisted: {
    id: 'system.admin.admin.MarketplaceListingShow.stateUnlisted',
    defaultMessage: 'Unlisted',
  },
  deletedSuffix: {
    id: 'system.admin.admin.MarketplaceListingShow.deletedSuffix',
    defaultMessage: '(deleted)',
  },
  // Rendered ONLY when the original is gone. While it exists there is nothing to say: the heading
  // names it and "Open source assessment" opens it, so a field repeating the heading's own text
  // would be noise — and the label is what lets this state the deletion without repeating it either.
  originalAssessment: {
    id: 'system.admin.admin.MarketplaceListingShow.originalAssessment',
    defaultMessage: 'Original assessment',
  },
  originalDeleted: {
    id: 'system.admin.admin.MarketplaceListingShow.originalDeleted',
    defaultMessage: 'deleted',
  },
  assessmentDeletedHint: {
    id: 'system.admin.admin.MarketplaceListingShow.assessmentDeletedHint',
    defaultMessage:
      'The assessment this listing was originally published from has been deleted. The listing is unaffected: it goes on serving its last published version, and a source assessment is saved in the marketplace’s preview course so new versions can still be published.',
  },
  courseDeletedHint: {
    id: 'system.admin.admin.MarketplaceListingShow.courseDeletedHint',
    defaultMessage:
      'The course this listing was published from has been deleted. Its name is kept as a record of where the content came from.',
  },
  openSourceAssessment: {
    id: 'system.admin.admin.MarketplaceListingShow.openSourceAssessment',
    defaultMessage: 'Open source assessment',
  },
  marketplaceHosted: {
    id: 'system.admin.admin.MarketplaceListingShow.marketplaceHosted',
    defaultMessage: 'Marketplace-hosted',
  },
  marketplaceHostedHint: {
    id: 'system.admin.admin.MarketplaceListingShow.marketplaceHostedHint',
    defaultMessage:
      "This listing's source assessment lives in the marketplace's own preview course, not in the course it was originally published from - the original was deleted, so the marketplace saved one to keep publishing from.",
  },
  orphaned: {
    id: 'system.admin.admin.MarketplaceListingShow.orphaned',
    defaultMessage: 'Orphaned',
  },
  orphanedHint: {
    id: 'system.admin.admin.MarketplaceListingShow.orphanedHint',
    defaultMessage:
      'This listing has no source assessment, which should not happen: one is rebuilt automatically whenever an assessment or the course holding it is deleted. Rebuild it from the latest published version on the listings page, or delete the listing if there is no version left to rebuild from.',
  },
  unknown: {
    id: 'system.admin.admin.MarketplaceListingShow.unknown',
    defaultMessage: '—',
  },
});

const STATE_COLORS = {
  published: 'success',
  unlisted: 'default',
} as const;

interface LoadedListing {
  listingId: string;
  data: MarketplaceListingDetailData;
}

const MarketplaceListingShow: FC = () => {
  const { t } = useTranslation();
  const { listingId } = useParams();
  const [loadedListing, setLoadedListing] = useState<LoadedListing>();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) {
      setLoadedListing(undefined);
      setFailed(false);
      setLoading(false);
      return (): void => {};
    }

    let active = true;
    setLoadedListing(undefined);
    setFailed(false);
    setLoading(true);

    SystemAPI.admin
      .fetchMarketplaceListing(Number(listingId))
      .then((response) => {
        if (active) setLoadedListing({ listingId, data: response.data });
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [listingId]);

  // Marketplace visibility, and only that. Whether either origin still exists is reported on the
  // provenance line below, because a listing can be published and have a deleted origin at once.
  const stateLabel = (state: MarketplaceListingState): string =>
    state === 'published'
      ? t(translations.statePublished)
      : t(translations.stateUnlisted);

  const deletedOrigin = (name: string, hint: string): JSX.Element => (
    <Tooltip title={hint}>
      <span>
        <span className="line-through">{name}</span>{' '}
        {t(translations.deletedSuffix)}
      </span>
    </Tooltip>
  );

  const date = (value: string | null): string =>
    value ? formatLongDateTime(value) : t(translations.unknown);
  const listing =
    loadedListing && loadedListing.listingId === listingId
      ? loadedListing.data
      : undefined;

  if (loading) return <LoadingIndicator />;

  if (failed || !listing) {
    return (
      <Page backTo="/admin/marketplace_listings" title={t(translations.header)}>
        <Typography color="text.secondary" variant="body2">
          {t(translations.fetchFailure)}
        </Typography>
      </Page>
    );
  }

  // Links to the instance's own landing page, matching the index table's Instance column. Plain text
  // once the origin instance has been deleted, which takes the host with it.
  const sourceInstanceName = (): JSX.Element | string => {
    if (!listing.sourceInstanceName || !listing.sourceInstanceHost)
      return listing.sourceInstanceName ?? t(translations.unknown);

    return (
      <Link href={`//${listing.sourceInstanceHost}/`} underline="hover">
        {listing.sourceInstanceName}
      </Link>
    );
  };

  const sourceCourseName = (): JSX.Element | string => {
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
  };

  return (
    <Page backTo="/admin/marketplace_listings" title={t(translations.header)}>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Typography variant="h6">
            {listing.title ?? t(translations.unknown)}
          </Typography>

          <Chip
            color={STATE_COLORS[listing.state]}
            label={stateLabel(listing.state)}
            size="small"
          />

          {/* The same fault marker the index carries, so an admin who followed a red chip here is not
              met by a page that looks healthy. The remedy lives on the index, and the hint says so:
              every mutation stays there. */}
          {listing.authoringAssessmentUrl === null && (
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

        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <Typography color="text.secondary" variant="body2">
            {t(translations.sourceCourse)}: {sourceCourseName()}
          </Typography>

          <Typography color="text.secondary" variant="body2">
            {t(translations.instance)}: {sourceInstanceName()}
          </Typography>

          {listing.sourceAssessmentDeleted && (
            <Typography color="text.secondary" variant="body2">
              {t(translations.originalAssessment)}:{' '}
              <Tooltip title={t(translations.assessmentDeletedHint)}>
                <span className="underline decoration-dotted">
                  {t(translations.originalDeleted)}
                </span>
              </Tooltip>
            </Typography>
          )}

          {listing.authoringAssessmentUrl && (
            <Typography variant="body2">
              <Link href={listing.authoringAssessmentUrl} underline="hover">
                {t(translations.openSourceAssessment)}
              </Link>
            </Typography>
          )}
        </div>
      </div>

      <Typography className="mb-2" variant="subtitle1">
        {t(translations.versionHistory)}
      </Typography>

      {listing.versions.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          {t(translations.noVersions)}
        </Typography>
      ) : (
        <Table
          aria-label={t(translations.versionHistory)}
          className="mb-8"
          size="small"
        >
          <TableHead>
            <TableRow>
              <TableCell>{t(translations.colVersion)}</TableCell>
              <TableCell>{t(translations.colPublisher)}</TableCell>
              <TableCell>{t(translations.colContent)}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {listing.versions.map((version) => (
              <TableRow key={version.publishedAt}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {date(version.publishedAt)}
                    {version.isCurrent && (
                      <Chip
                        color="primary"
                        label={t(translations.currentBadge)}
                        size="small"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {version.publisherName ?? t(translations.unknown)}
                </TableCell>
                <TableCell>
                  {version.snapshotUrl ? (
                    <Link
                      external
                      href={version.snapshotUrl}
                      opensInNewTab
                      underline="hover"
                    >
                      {t(translations.viewVersion, {
                        version: date(version.publishedAt),
                      })}
                    </Link>
                  ) : (
                    t(translations.unknown)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Typography className="mb-2" variant="subtitle1">
        {t(translations.adoptions)}
      </Typography>

      {listing.adoptions.length === 0 ? (
        <Typography color="text.secondary" variant="body2">
          {t(translations.noAdoptions)}
        </Typography>
      ) : (
        <Table aria-label={t(translations.adoptions)} size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t(translations.colCourse)}</TableCell>
              <TableCell>{t(translations.colVersionHeld)}</TableCell>
              <TableCell>{t(translations.colAdoptedAt)}</TableCell>
              <TableCell>{t(translations.colContent)}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {listing.adoptions.map((adoption) => (
              <TableRow key={adoption.id}>
                <TableCell>
                  {adoption.destinationCourseId &&
                  adoption.destinationCourseHost ? (
                    <Link
                      href={`//${adoption.destinationCourseHost}/courses/${adoption.destinationCourseId}/assessments`}
                      underline="hover"
                    >
                      {adoption.destinationCourseName ??
                        `#${adoption.destinationCourseId}`}
                    </Link>
                  ) : (
                    adoption.destinationCourseName ?? t(translations.unknown)
                  )}
                </TableCell>
                <TableCell>{date(adoption.adoptedVersionAt)}</TableCell>
                <TableCell>{date(adoption.adoptedAt)}</TableCell>
                <TableCell>
                  {adoption.snapshotUrl && adoption.adoptedVersionAt ? (
                    <Link
                      external
                      href={adoption.snapshotUrl}
                      opensInNewTab
                      underline="hover"
                    >
                      {t(translations.viewVersion, {
                        version: date(adoption.adoptedVersionAt),
                      })}
                    </Link>
                  ) : (
                    t(translations.unknown)
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Page>
  );
};

export default MarketplaceListingShow;
