import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ContentCopy, PlayArrow } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, Chip, Paper } from '@mui/material';

// Reuse the assessment show page's "Questions" heading so wording + locales stay identical.
import assessmentTranslations from 'course/assessment/translations';
import { useCourseContext } from 'course/container/CourseLoader';
import DescriptionCard from 'lib/components/core/DescriptionCard';
import Page from 'lib/components/core/layouts/Page';
import Subsection from 'lib/components/core/layouts/Subsection';
import Preload from 'lib/components/wrappers/Preload';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicateConfirmation from '../../components/DuplicateConfirmation';
import { withFromTab } from '../../fromTab';
import { fetchListing } from '../../operations';
import translations from '../../translations';
import { ListingPreviewData } from '../../types';

import PreviewAssessmentDetails from './PreviewAssessmentDetails';
import PreviewQuestionCard from './PreviewQuestionCard';

const ListingPreview = (): JSX.Element => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { courseTitle, courseUrl } = useCourseContext();
  const [params] = useSearchParams();
  // `from_tab` rides in from the marketplace index so the duplicate lands in the tab the user came
  // from; null when they reached the preview directly, which DuplicateConfirmation renders fine.
  const fromTab = params.get('from_tab');
  const destinationTabId = parseInt(fromTab ?? '', 10) || null;
  const [duplicating, setDuplicating] = useState(false);
  const [attempting, setAttempting] = useState(false);
  const attemptUrl = withFromTab(
    `${courseUrl}/marketplace/listings/${listingId}/attempt`,
    fromTab,
  );

  return (
    <Preload
      render={<div />}
      while={(): Promise<ListingPreviewData> => fetchListing(Number(listingId))}
    >
      {(listing): JSX.Element => (
        <Page
          actions={
            <>
              <LoadingButton
                className="min-w-32 px-4"
                color="primary"
                loading={attempting}
                onClick={(): void => {
                  setAttempting(true);
                  navigate(attemptUrl);
                }}
                startIcon={<PlayArrow />}
                variant="outlined"
              >
                {t(translations.tryItOut)}
              </LoadingButton>
              <Button
                color="primary"
                onClick={(): void => setDuplicating(true)}
                startIcon={<ContentCopy />}
                variant="contained"
              >
                {t(translations.duplicateAssessment)}
              </Button>
            </>
          }
          backTo={withFromTab(`${courseUrl}/marketplace`, fromTab)}
          className="space-y-5"
          title={
            <span className="flex items-center gap-2">
              {listing.title}
              <Chip
                label={t(translations.previewBadge)}
                size="small"
                variant="outlined"
              />
            </span>
          }
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
            destinationCourse={{ title: courseTitle, url: courseUrl }}
            destinationTabs={listing.destinationTabs}
            initialDestinationTabId={destinationTabId}
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
