import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ContentCopy, PlayArrow } from '@mui/icons-material';
import { Button, Chip, CircularProgress, Paper } from '@mui/material';

// Reuse the assessment show page's "Questions" heading so wording + locales stay identical.
import assessmentTranslations from 'course/assessment/translations';
import { useCourseContext } from 'course/container/CourseLoader';
import DescriptionCard from 'lib/components/core/DescriptionCard';
import Page from 'lib/components/core/layouts/Page';
import Subsection from 'lib/components/core/layouts/Subsection';
import Link from 'lib/components/core/Link';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicateConfirmation from '../../components/DuplicateConfirmation';
import { withFromTab } from '../../fromTab';
import { fetchListing } from '../../operations';
import translations from '../../translations';
import { ListingPreviewData } from '../../types';
import { useNavigatingTo } from '../../useNavigatingTo';

import PreviewAssessmentDetails from './PreviewAssessmentDetails';
import PreviewQuestionCard from './PreviewQuestionCard';

// Routes to the listing's attempt loader, which provisions the preview copy and hands off to the
// real attempt flow. That loader is slow, so while it is opening we swap the play icon for a spinner
// and disable the button rather than leave the page looking frozen after the click.
const TryItOutButton = ({
  label,
  to,
}: {
  label: string;
  to: string;
}): JSX.Element => {
  const pending = useNavigatingTo(to);

  return pending ? (
    <Button
      color="primary"
      disabled
      startIcon={<CircularProgress size={16} />}
      variant="outlined"
    >
      {label}
    </Button>
  ) : (
    <Button
      color="primary"
      component={Link}
      startIcon={<PlayArrow />}
      to={to}
      variant="outlined"
    >
      {label}
    </Button>
  );
};

const ListingPreview = (): JSX.Element => {
  const { listingId } = useParams();
  const { t } = useTranslation();
  const { courseTitle, courseUrl } = useCourseContext();
  const [params] = useSearchParams();
  // `from_tab` rides in from the marketplace index so the duplicate lands in the tab the user came
  // from; null when they reached the preview directly, which DuplicateConfirmation renders fine.
  const fromTab = params.get('from_tab');
  const destinationTabId = parseInt(fromTab ?? '', 10) || null;
  const [duplicating, setDuplicating] = useState(false);

  return (
    <Preload
      render={<div />}
      while={(): Promise<ListingPreviewData> => fetchListing(Number(listingId))}
    >
      {(listing): JSX.Element => (
        <Page
          actions={
            <div className="flex gap-2">
              <TryItOutButton
                label={t(translations.tryItOut)}
                to={listing.attemptUrl}
              />

              <Button
                color="primary"
                onClick={(): void => setDuplicating(true)}
                startIcon={<ContentCopy />}
                variant="contained"
              >
                {t(translations.duplicateAssessment)}
              </Button>
            </div>
          }
          backTo={withFromTab(`${courseUrl}/marketplace`, fromTab)}
          className="space-y-5"
          title={listing.title}
        >
          {listing.description && (
            <DescriptionCard description={listing.description} />
          )}

          <PreviewAssessmentDetails for={listing} />

          <Subsection spaced title={t(assessmentTranslations.questions)}>
            <div className="flex flex-wrap gap-2">
              {Object.entries(listing.typeCounts).map(([type, n]) => (
                <Chip key={type} label={`${n} ${type}`} size="small" />
              ))}
            </div>

            <Paper variant="outlined">
              {listing.questions.map((question, index) => (
                <PreviewQuestionCard
                  key={question.id}
                  fromTab={fromTab}
                  index={index}
                  listingId={String(listingId)}
                  of={question}
                />
              ))}
            </Paper>
          </Subsection>

          <DuplicateConfirmation
            destinationCategory={null}
            destinationCourse={{ title: courseTitle, url: courseUrl }}
            destinationTab={null}
            destinationTabId={destinationTabId}
            listings={[{ id: listing.id, title: listing.title }]}
            onClose={(): void => setDuplicating(false)}
            open={duplicating}
          />
        </Page>
      )}
    </Preload>
  );
};

export default ListingPreview;
