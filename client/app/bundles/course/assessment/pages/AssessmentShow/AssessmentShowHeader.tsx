import { Link } from 'react-router-dom';
import { Create, Delete, Inventory } from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { AssessmentData } from 'types/course/assessment/assessments';

import PageHeader from 'lib/components/navigation/PageHeader';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import { ACTION_LABELS } from '../AssessmentsIndex/ActionButtons';

import DeleteAssessmentPrompt from './prompts/DeleteAssessmentPrompt';

interface AssessmentShowHeaderProps {
  with: AssessmentData;
}

const AssessmentShowHeader = (
  props: AssessmentShowHeaderProps,
): JSX.Element => {
  const { with: assessment } = props;
  const { t } = useTranslation();
  const [deleting, toggleDeleting] = useToggle();

  return (
    <>
      <PageHeader returnLink={assessment.indexUrl} title={assessment.title}>
        {assessment.deleteUrl && (
          <Tooltip disableInteractive title={t(translations.deleteAssessment)}>
            <IconButton
              aria-label={t(translations.deleteAssessment)}
              color="error"
              onClick={toggleDeleting}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        )}

        {assessment.editUrl && (
          <Tooltip disableInteractive title={t(translations.editAssessment)}>
            <Link to={assessment.editUrl}>
              <IconButton
                aria-label={t(translations.editAssessment)}
                className="text-white"
              >
                <Create />
              </IconButton>
            </Link>
          </Tooltip>
        )}

        {assessment.submissionsUrl && (
          <Tooltip disableInteractive title={t(translations.submissions)}>
            <IconButton
              aria-label={t(translations.submissions)}
              className="text-white"
              // TODO: Change to react-router Link once SPA
              href={assessment.submissionsUrl}
            >
              <Inventory />
            </IconButton>
          </Tooltip>
        )}

        {assessment.actionButtonUrl && (
          <Button
            aria-label={t(ACTION_LABELS[assessment.status])}
            className="ml-4 bg-white"
            // TODO: Change to react-router Link once SPA
            href={assessment.actionButtonUrl}
            variant="outlined"
          >
            {t(ACTION_LABELS[assessment.status])}
          </Button>
        )}
      </PageHeader>

      <DeleteAssessmentPrompt
        for={assessment}
        onClose={toggleDeleting}
        open={deleting}
      />
    </>
  );
};

export default AssessmentShowHeader;
