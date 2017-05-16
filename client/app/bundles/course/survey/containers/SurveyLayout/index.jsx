import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import IconButton from 'material-ui/IconButton';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import history from 'lib/history';
import TitleBar from 'lib/components/TitleBar';
import { surveyShape } from 'course/survey/propTypes';
import SurveyShow from 'course/survey/pages/SurveyShow';
import SurveyResults from 'course/survey/pages/SurveyResults';
import ResponseShow from 'course/survey/pages/ResponseShow';
import ResponseEdit from 'course/survey/pages/ResponseEdit';
import ResponseIndex from 'course/survey/pages/ResponseIndex';
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

class SurveyLayout extends React.Component {
  static renderTitleBar(survey, surveyId, showAdminMenu, backLocation) {
    return (
      <TitleBar
        title={survey.title}
        iconElementRight={showAdminMenu ? <AdminMenu {...{ survey, surveyId }} /> : null}
        iconElementLeft={<IconButton><ArrowBack /></IconButton>}
        onLeftIconButtonTouchTap={() => history.push(backLocation)}
      />
    );
  }

  render() {
    const { surveys, match: { url, isExact, params: { courseId, surveyId } } } = this.props;
    const survey = surveys && surveys.length > 0 ?
                   surveys.find(s => String(s.id) === String(surveyId)) : {};
    const surveyUrl = url.slice(-1) === '/' ? url : `${url}/`;

    const renderWithProps = Page => props => (
      <div>
        { SurveyLayout.renderTitleBar(survey, surveyId, isExact, backLocations(courseId, surveyId, Page)) }
        <Page {...{ survey, courseId, surveyId }} {...props} />
      </div>
    );

    return (
      <Switch>
        <Route exact path={url} render={renderWithProps(SurveyShow)} />
        <Route exact path={`${surveyUrl}results`} render={renderWithProps(SurveyResults)} />
        <Route exact path={`${surveyUrl}responses`} render={renderWithProps(ResponseIndex)} />
        <Route exact path={`${surveyUrl}responses/:responseId`} render={renderWithProps(ResponseShow)} />
        <Route exact path={`${surveyUrl}responses/:responseId/edit`} render={renderWithProps(ResponseEdit)} />
      </Switch>
    );
  }
}

SurveyLayout.propTypes = {
  surveys: PropTypes.arrayOf(surveyShape),
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      surveyId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default connect(
  state => ({ surveys: state.surveys })
)(SurveyLayout);
