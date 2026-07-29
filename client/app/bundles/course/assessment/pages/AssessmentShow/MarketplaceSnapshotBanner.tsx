import { Alert, Typography } from '@mui/material';
import { MarketplaceVersionData } from 'types/course/assessment/assessments';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface Props {
  version?: MarketplaceVersionData;
}

/**
 * Warns a system admin that this assessment is a published version rather than a source assessment.
 * Every management affordance stays live - the surface is admin-only and the escape hatch for
 * fixing served content is deliberate - so this banner is the only thing on the page saying that
 * editing here changes what future adopters copy without publishing a version.
 *
 * Not dismissible, for the reason MarketplaceUpdateBanner gives: it states a fact about the object,
 * so it stands for exactly as long as it is true.
 */
const MarketplaceSnapshotBanner = ({ version }: Props): JSX.Element | null => {
  const { t } = useTranslation();

  // An assessment the marketplace does not own carries no version at all.
  if (!version) return null;
  // A null vintage is the listing's working copy, which is exactly what an admin is meant to edit.
  // Kept as its own guard rather than an optional chain: `version?.publishedAt === null` is false
  // for an absent version, so the two conditions do not collapse into one.
  if (version.publishedAt === null) return null;

  return (
    <Alert classes={{ message: 'space-y-2' }} severity="warning">
      <Typography variant="body2">
        {t(translations.marketplaceSnapshotWarning)}
      </Typography>

      {/* `href`, not `to`: `to` routes through ReactRouterLink and would treat a cross-instance
          absolute url as an in-app path. `external` also renders the ArrowOutward affordance. */}
      {version.sourceAssessmentUrl ? (
        <Link
          external
          href={version.sourceAssessmentUrl}
          opensInNewTab
          underline="hover"
        >
          {t(translations.marketplaceSnapshotSourceLink)}
        </Link>
      ) : (
        <Typography variant="body2">
          {t(translations.marketplaceSnapshotSourceMissing)}
        </Typography>
      )}
    </Alert>
  );
};

export default MarketplaceSnapshotBanner;
