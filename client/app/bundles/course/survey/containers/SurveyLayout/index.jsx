import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { IconButton } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import TitleBar from 'lib/components/TitleBar';
import { surveyShape } from 'course/survey/propTypes';
import SurveyShow from 'course/survey/pages/SurveyShow';
import SurveyResults from 'course/survey/pages/SurveyResults';
import ResponseShow from 'course/survey/pages/ResponseShow';
import ResponseEdit from 'course/survey/pages/ResponseEdit';
import ResponseIndex from 'course/survey/pages/ResponseIndex';
import AdminMenu from './AdminMenu';

const SurveyLayout = ({ surveys }) => {
  const navigate = useNavigate();
  const params = useParams();
  const surveyId = params.surveyId;
  const courseId = params.courseId;
  const survey =
    surveys && surveys.length > 0
      ? surveys.find((s) => String(s.id) === String(params.surveyId))
      : {};

  return (
    <>
      <TitleBar
        title={survey.title}
        iconElementRight={
          surveyId ? <AdminMenu {...{ survey, surveyId }} /> : null
        }
        iconElementLeft={
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack htmlColor="white" />
          </IconButton>
        }
      />
      <Routes>
        <Route
          path=""
          element={<SurveyShow {...{ survey, courseId, surveyId }} />}
        />
        <Route
          exact
          path="/results"
          element={<SurveyResults {...{ survey, courseId, surveyId }} />}
        />
        <Route
          exact
          path="/responses"
          element={<ResponseIndex {...{ survey, courseId, surveyId }} />}
        />
        <Route
          exact
          path="/responses/:responseId"
          element={<ResponseShow {...{ survey, courseId, surveyId }} />}
        />
        <Route
          exact
          path="/responses/:responseId/edit"
          element={<ResponseEdit {...{ survey, courseId, surveyId }} />}
        />
      </Routes>
    </>
  );
};

SurveyLayout.propTypes = {
  surveys: PropTypes.arrayOf(surveyShape),
};

export default connect((state) => ({ surveys: state.surveys }))(SurveyLayout);
