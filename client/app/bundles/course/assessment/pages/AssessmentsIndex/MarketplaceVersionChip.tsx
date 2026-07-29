import { FC } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { MarketplaceVersionData } from 'types/course/assessment/assessments';

import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import translations from '../../translations';

interface MarketplaceVersionChipProps {
  for: MarketplaceVersionData;
}

/**
 * Tells apart the assessments in the marketplace container course, which all sit in one tab under
 * their original titles. Two kinds live there: immutable published SNAPSHOTS, chipped with their
 * publication date, and the listing's editable WORKING COPY, chipped "Source Assessment". View-only —
 * nothing here is ever retitled, because an adopter's duplicated copy reads that title.
 */
const MarketplaceVersionChip: FC<MarketplaceVersionChipProps> = (props) => {
  const { for: marketplaceVersion } = props;
  const { t } = useTranslation();
  const publishedAt = marketplaceVersion.publishedAt;

  // A null vintage means the working copy, which is not a version at all — hence a different label
  // and a different colour, so an admin never mistakes it for something the marketplace serves.
  const isAuthoring = publishedAt === null;

  // Two different facts. `latest` is the newest cut; `listed` is whether the listing is on the
  // marketplace. Only their conjunction means "this is what an adopter gets", and only that earns
  // the strong label — so Live stands in for Latest rather than sitting beside it.
  const isLive = marketplaceVersion.latest && marketplaceVersion.listed;

  const hint = ((): string => {
    if (isAuthoring) {
      return marketplaceVersion.source
        ? t(translations.marketplaceAuthoringHintWithSource, {
            listingId: marketplaceVersion.listingId,
            source: marketplaceVersion.source,
          })
        : t(translations.marketplaceAuthoringHint, {
            listingId: marketplaceVersion.listingId,
          });
    }

    return marketplaceVersion.source
      ? t(translations.marketplaceVersionHintWithSource, {
          listingId: marketplaceVersion.listingId,
          source: marketplaceVersion.source,
        })
      : t(translations.marketplaceVersionHint, {
          listingId: marketplaceVersion.listingId,
        });
  })();

  // Date AND time: one container tab holds every snapshot of every listing, so same-day siblings
  // sit next to each other and the time is the only thing separating them.
  const label = isAuthoring
    ? t(translations.marketplaceAuthoring)
    : t(translations.marketplaceVersion, {
        version: formatLongDateTime(publishedAt),
      });

  return (
    <div className="flex items-center gap-2">
      <Tooltip disableInteractive title={hint}>
        <Chip
          color={isAuthoring ? 'secondary' : 'info'}
          label={label}
          size="small"
          // Without this the chip inherits MUI's `max-width: 100%` and ellipsizes inside the
          // narrow title track (see client/CLAUDE-gotchas.md).
          sx={{ maxWidth: 'none' }}
          variant="outlined"
        />
      </Tooltip>

      {/* A SECOND chip rather than recolouring the date, because the admin needs the date and the
          status at once — and because colour alone is not a signal everyone can read. Filled for
          Live so it is the thing the eye lands on among outlined neighbours; outlined for Latest,
          which is the same fact one degree weaker. */}
      {!isAuthoring && marketplaceVersion.latest && (
        <Tooltip
          disableInteractive
          title={t(
            isLive
              ? translations.marketplaceLiveHint
              : translations.marketplaceLatestHint,
          )}
        >
          <Chip
            color="success"
            label={t(
              isLive
                ? translations.marketplaceLive
                : translations.marketplaceLatest,
            )}
            size="small"
            sx={{ maxWidth: 'none' }}
            variant={isLive ? 'filled' : 'outlined'}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default MarketplaceVersionChip;
