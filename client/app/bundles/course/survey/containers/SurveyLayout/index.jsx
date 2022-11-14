import { connect } from 'react-redux';
import { Route, Routes, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';

import ResponseEdit from 'course/survey/pages/ResponseEdit';
import ResponseIndex from 'course/survey/pages/ResponseIndex';
import ResponseShow from 'course/survey/pages/ResponseShow';
import SurveyResults from 'course/survey/pages/SurveyResults';
import SurveyShow from 'course/survey/pages/SurveyShow';
import { surveyShape } from 'course/survey/propTypes';
import PageHeader from 'lib/components/navigation/PageHeader';

import AdminMenu from './AdminMenu';

const backLocations = (courseId, surveyId, Page) => {
  switch (Page) {
    case 'SurveyResults':
    case 'ResponseIndex':
      return `/courses/${courseId}/surveys/${surveyId}`;
    case 'SurveyShow':
    case 'ResponseShow':
    case 'ResponseEdit':
    default:
      return `/courses/${courseId}/surveys`;
  }
};

const PageWithTitleBar = (props) => {
  const { page, survey, surveyId, courseId } = props;

  let pageToRender = null;

  switch (page) {
    case 'SurveyResults':
      pageToRender = <SurveyResults {...{ survey, courseId, surveyId }} />;
      break;
    case 'ResponseIndex':
      pageToRender = <ResponseIndex {...{ survey, courseId, surveyId }} />;
      break;
    case 'SurveyShow':
      pageToRender = <SurveyShow {...{ survey, courseId, surveyId }} />;
      break;
    case 'ResponseShow':
      pageToRender = <ResponseShow {...{ survey, courseId, surveyId }} />;
      break;
    case 'ResponseEdit':
      pageToRender = <ResponseEdit {...{ survey, courseId, surveyId }} />;
      break;
    default:
      return null;
  }

  return (
    <>
      {survey && (
        <PageHeader
          returnLink={backLocations(courseId, surveyId, page)}
          title={survey.title}
          toolbars={
            surveyId
              ? [<AdminMenu key="admin-menu" {...{ survey, surveyId }} />]
              : null
          }
        />
      )}
      {pageToRender}
    </>
  );
};

PageWithTitleBar.propTypes = {
  page: PropTypes.string,
  survey: surveyShape,
  surveyId: PropTypes.string,
  courseId: PropTypes.string,
};

const SurveyLayout = ({ surveys }) => {
  const params = useParams();
  const surveyId = params.surveyId;
  const courseId = params.courseId;
  const survey =
    surveys && surveys.length > 0
      ? surveys.find((s) => String(s.id) === String(params.surveyId))
      : {};

  return (
    <Routes>
      <Route
        element={
          <PageWithTitleBar
            {...{ page: 'SurveyShow', survey, courseId, surveyId }}
          />
        }
        path=""
      />
      <Route
        element={
          <PageWithTitleBar
            {...{ page: 'SurveyResults', survey, courseId, surveyId }}
          />
        }
        exact
        path="/results"
      />
      <Route
        element={
          <PageWithTitleBar
            {...{ page: 'ResponseIndex', survey, courseId, surveyId }}
          />
        }
        exact
        path="/responses"
      />
      <Route
        element={
          <PageWithTitleBar
            {...{ page: 'ResponseShow', survey, courseId, surveyId }}
          />
        }
        exact
        path="/responses/:responseId"
      />
      <Route
        element={
          <PageWithTitleBar
            {...{ page: 'ResponseEdit', survey, courseId, surveyId }}
          />
        }
        exact
        path="/responses/:responseId/edit"
      />
    </Routes>
  );
};

SurveyLayout.propTypes = {
  surveys: PropTypes.arrayOf(surveyShape),
};

export default connect((state) => ({ surveys: state.surveys }))(SurveyLayout);
