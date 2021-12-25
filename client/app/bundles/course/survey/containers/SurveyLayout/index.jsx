import { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import PropTypes from 'prop-types';

import ResponseEdit from 'course/survey/pages/ResponseEdit';
import ResponseIndex from 'course/survey/pages/ResponseIndex';
import ResponseShow from 'course/survey/pages/ResponseShow';
import SurveyResults from 'course/survey/pages/SurveyResults';
import SurveyShow from 'course/survey/pages/SurveyShow';
import { surveyShape } from 'course/survey/propTypes';
import TitleBar from 'lib/components/TitleBar';
import history from 'lib/history';

import AdminMenu from './AdminMenu';

const backLocations = (courseId, surveyId, Page) => {
  switch (Page) {
    case SurveyResults:
    case ResponseIndex:
      return `/courses/${courseId}/surveys/${surveyId}`;
    case SurveyShow:
    case ResponseShow:
    case ResponseEdit:
    default:
      return `/courses/${courseId}/surveys`;
  }
};

class SurveyLayout extends Component {
  static renderTitleBar(survey, surveyId, showAdminMenu, backLocation) {
    return (
      <TitleBar
        iconElementLeft={
          <IconButton>
            <ArrowBack />
          </IconButton>
        }
        iconElementRight={
          showAdminMenu ? <AdminMenu {...{ survey, surveyId }} /> : null
        }
        onLeftIconButtonClick={() => history.push(backLocation)}
        title={survey.title}
      />
    );
  }

  render() {
    const {
      surveys,
      match: {
        url,
        isExact,
        params: { courseId, surveyId },
      },
    } = this.props;
    const survey =
      surveys && surveys.length > 0
        ? surveys.find((s) => String(s.id) === String(surveyId))
        : {};
    const surveyUrl = url.slice(-1) === '/' ? url : `${url}/`;

    // eslint-disable-next-line react/no-unstable-nested-components
    const renderWithProps = (Page) => (props) =>
      (
        <>
          {SurveyLayout.renderTitleBar(
            survey,
            surveyId,
            isExact,
            backLocations(courseId, surveyId, Page),
          )}
          <Page {...{ survey, courseId, surveyId }} {...props} />
        </>
      );

    return (
      <Switch>
        <Route exact={true} path={url} render={renderWithProps(SurveyShow)} />
        <Route
          exact={true}
          path={`${surveyUrl}results`}
          render={renderWithProps(SurveyResults)}
        />
        <Route
          exact={true}
          path={`${surveyUrl}responses`}
          render={renderWithProps(ResponseIndex)}
        />
        <Route
          exact={true}
          path={`${surveyUrl}responses/:responseId`}
          render={renderWithProps(ResponseShow)}
        />
        <Route
          exact={true}
          path={`${surveyUrl}responses/:responseId/edit`}
          render={renderWithProps(ResponseEdit)}
        />
      </Switch>
    );
  }
}

SurveyLayout.propTypes = {
  surveys: PropTypes.arrayOf(surveyShape),
  match: PropTypes.shape({
    url: PropTypes.string,
    isExact: PropTypes.bool,
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      surveyId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default connect((state) => ({ surveys: state.surveys }))(SurveyLayout);
