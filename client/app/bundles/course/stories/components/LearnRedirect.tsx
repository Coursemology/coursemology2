import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useCourseContext } from 'course/container/CourseLoader';

interface LearnRedirectProps {
  to: string;
  otherwiseRender: ReactNode;
}

const LearnRedirect = (props: LearnRedirectProps): ReactNode => {
  const { homeRedirectsToLearn } = useCourseContext();
  if (!homeRedirectsToLearn) return props.otherwiseRender;

  return <Navigate to={props.to} />;
};

export default LearnRedirect;
