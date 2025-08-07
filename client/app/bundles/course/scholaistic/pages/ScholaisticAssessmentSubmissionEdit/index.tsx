import { useParams } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';
import { object, string } from 'yup';

import CourseAPI from 'api/course';
import submissionTranslations from 'course/assessment/submission/translations';
import { withScholaisticAsyncContainer } from 'course/scholaistic/components/ScholaisticAsyncContainer';
import ScholaisticFramePage from 'course/scholaistic/components/ScholaisticFramePage';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { useLoader } from './loader';

const ScholaisticAssessmentSubmissionEdit = (): JSX.Element => {
  const data = useLoader();

  const { t } = useTranslation();

  const assessmentId = getIdFromUnknown(useParams().assessmentId)!;

  return (
    <ScholaisticFramePage
      onMessage={({ type, payload }) => {
        if (type !== 'submitted') return;

        (async (): Promise<void> => {
          try {
            const { submissionId } = await object({
              submissionId: string().required(),
            }).validate(payload);

            await CourseAPI.scholaistic.fetchSubmission(
              assessmentId,
              submissionId,
            );

            toast.success(t(submissionTranslations.updateSuccess));
          } catch (error) {
            if (!(error instanceof Error)) throw error;

            toast.error(
              t(submissionTranslations.updateFailure, {
                errors: error.message,
              }),
            );
          }
        })();
      }}
      src={data.embedSrc}
    />
  );
};

export default withScholaisticAsyncContainer(
  ScholaisticAssessmentSubmissionEdit,
);
