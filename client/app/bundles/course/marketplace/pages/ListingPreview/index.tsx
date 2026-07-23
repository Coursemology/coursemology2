import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ContentCopy, PlayArrow } from '@mui/icons-material';
import { Button, Chip, Paper } from '@mui/material';

// Reuse the assessment show page's "Questions" heading so wording + locales stay identical.
import assessmentTranslations from 'course/assessment/translations';
import { useCourseContext } from 'course/container/CourseLoader';
import { setNotification } from 'lib/actions';
import DescriptionCard from 'lib/components/core/DescriptionCard';
import Page from 'lib/components/core/layouts/Page';
import Subsection from 'lib/components/core/layouts/Subsection';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicateConfirmation from '../../components/DuplicateConfirmation';
import { withFromTab } from '../../fromTab';
import { createAttempt, fetchListing } from '../../operations';
import translations from '../../translations';
import { ListingPreviewData } from '../../types';

import PreviewAssessmentDetails from './PreviewAssessmentDetails';
import PreviewQuestionCard from './PreviewQuestionCard';

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

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [attempting, setAttempting] = useState(false);

  const handleAttempt = async (): Promise<void> => {
    setAttempting(true);
    try {
      const { id } = await createAttempt(Number(listingId));
      navigate(
        `${courseUrl}/marketplace/attempt/${id}/edit?fromListing=${listingId}`,
      );
    } catch {
      dispatch(setNotification(translations.attemptFailed));
      setAttempting(false);
    }
  };

  return (
    <Preload
      render={<div />}
      while={(): Promise<ListingPreviewData> => fetchListing(Number(listingId))}
    >
      {(listing): JSX.Element => (
        <Page
          actions={
            <>
              <Button
                color="primary"
                disabled={attempting}
                onClick={handleAttempt}
                startIcon={<PlayArrow />}
                variant="outlined"
              >
                {t(translations.attemptAssessment)}
              </Button>
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
