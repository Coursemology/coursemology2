import { Alert } from '@mui/material';
import { ScholaisticSettingsData } from 'types/course/admin/scholaistic';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const PingResultAlert = ({
  result,
}: {
  result: ScholaisticSettingsData['pingResult'];
}): JSX.Element => {
  const { t } = useTranslation();

  if (result.status === 'error')
    return (
      <Alert severity="error">
        {t({
          defaultMessage:
            "This course's link to ScholAIstic can't be verified. Either ScholAIstic is not reachable at the moment, or the link is invalid. Try again later, or try relinking the courses again.",
        })}
      </Alert>
    );

  return (
    <Alert severity="success">
      {t(
        {
          defaultMessage:
            'This course is linked to the {course} course on ScholAIstic.',
        },
        {
          course: (
            <Link external href={result.url} opensInNewTab>
              {result.title}
            </Link>
          ),
        },
      )}
    </Alert>
  );
};

export default PingResultAlert;
