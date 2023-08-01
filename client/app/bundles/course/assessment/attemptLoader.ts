import { LoaderFunction, redirect } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';

const assessmentAttemptLoader: LoaderFunction = async ({ params }) => {
  const assessmentId = getIdFromUnknown(params?.assessmentId);
  if (!assessmentId) return redirect('/');

  const { data } = await CourseAPI.assessment.assessments.attempt(assessmentId);
  return redirect(data.redirectUrl);
};

export default assessmentAttemptLoader;
