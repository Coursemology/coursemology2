import { Card, CardContent } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

const AnswerNotImplemented = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Card className="bg-yellow-100">
      <CardContent>
        {t({
          id: 'course.assessment.submission.Answer.rendererNotImplemented',
          defaultMessage:
            'The display for this question type has not been implemented yet.',
        })}
      </CardContent>
    </Card>
  );
};

export default AnswerNotImplemented;
