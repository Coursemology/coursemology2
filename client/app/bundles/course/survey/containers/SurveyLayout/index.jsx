import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import Page from 'lib/components/core/layouts/Page';

import Dialogs from '../../components/Dialogs';
import { surveyShape } from '../../propTypes';

import AdminMenu from './AdminMenu';

const backLocations = (courseId, surveyId, componentName) => {
  switch (componentName) {
    case 'SurveyResults':
    case 'Connect(ResponseIndex)':
      return `/courses/${courseId}/surveys/${surveyId}`;
    default:
      return `/courses/${courseId}/surveys`;
  }
};

const withSurveyLayout = (Component) => {
  const WrappedComponent = ({ surveys }) => {
    const params = useParams();
    const surveyId = params.surveyId;
    const courseId = params.courseId;
    const survey =
      surveys && surveys.length > 0
        ? surveys.find((s) => String(s.id) === String(params.surveyId))
        : {};

    const page = Component.displayName;

    if (!survey) return null;

    return (
      <Page
        actions={
          surveyId && <AdminMenu key="admin-menu" {...{ survey, surveyId }} />
        }
        backTo={backLocations(courseId, surveyId, page)}
        title={survey.title}
      >
        <Component courseId={courseId} survey={survey} surveyId={surveyId} />

        <Dialogs />
      </Page>
    );
  };

  WrappedComponent.propTypes = { surveys: PropTypes.arrayOf(surveyShape) };
  WrappedComponent.displayName = `withSurveyLayout(${Component.displayName})`;

  return connect(({ surveys }) => ({ surveys: surveys.surveys }))(
    WrappedComponent,
  );
};

export default withSurveyLayout;
