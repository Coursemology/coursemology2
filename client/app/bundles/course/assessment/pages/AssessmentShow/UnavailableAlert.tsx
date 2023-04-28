import { Alert, Typography } from '@mui/material';
import { AssessmentData } from 'types/course/assessment/assessments';

import useTranslation from 'lib/hooks/useTranslation';
import { formatFullDateTime } from 'lib/moment';

import translations from '../../translations';

interface UnavailableAlertProps {
  for: AssessmentData;
}

const UnavailableAlert = (props: UnavailableAlertProps): JSX.Element => {
  const { for: assessment } = props;
  const { t } = useTranslation();

  if (!assessment.permissions.canAttempt)
    return (
      <Alert classes={{ message: 'space-y-5' }} severity="warning">
        {assessment.willStartAt && (
          <Typography variant="body2">
            {t(translations.assessmentOnlyAvailableFrom)}&nbsp;
            <b>{formatFullDateTime(assessment.willStartAt)}</b>.
          </Typography>
        )}

        <section>
          <Typography variant="body2">
            {t(translations.needToFulfilTheseRequirements)}
          </Typography>

          <ul className="m-0">
            {assessment.requirements.map((condition) => (
              <Typography key={condition.title} component="li" variant="body2">
                {condition.satisfied ? (
                  <>
                    <s>{condition.title}</s>&nbsp;✅
                  </>
                ) : (
                  condition.title
                )}
              </Typography>
            ))}
          </ul>
        </section>
      </Alert>
    );

  return (
    <Alert severity="error">
      {t(translations.cannotAttemptBecauseNotAUser)}
    </Alert>
  );
};

export default UnavailableAlert;
