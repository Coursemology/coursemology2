import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
import { fetchLessonPlan } from 'course/lesson-plan/actions';
import LessonPlanShow from 'course/lesson-plan/pages/LessonPlanShow';
import LessonPlanEdit from 'course/lesson-plan/pages/LessonPlanEdit';
import LessonPlanFilter from 'course/lesson-plan/containers/LessonPlanFilter';
import LessonPlanNav from 'course/lesson-plan/containers/LessonPlanNav';

const translations = defineMessages({
  empty: {
    id: 'course.lessonPlan.LessonPlanLayout.empty',
    defaultMessage: 'The lesson plan is empty.',
  },
});

const styles = {
  tools: {
    position: 'fixed',
    bottom: 12,
    right: 24,
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  mainBody: {
    // Allow end part of table to be unobstructed when scrolled all the way to the bottom
    marginBottom: 100,
  },
};

class LessonPlanLayout extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
      items: PropTypes.array,
    })).isRequired,
    notification: notificationShape.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchLessonPlan());
  }

  render() {
    const { isLoading, groups, notification } = this.props;

    if (isLoading) { return <LoadingIndicator />; }

    if (!groups || groups.length < 1) {
      return <Subheader><FormattedMessage {...translations.empty} /></Subheader>;
    }

    const lessonPlanPath = '/courses/:courseId/lesson_plan';
    return (
      <div style={styles.mainBody}>
        <Switch>
          <Route exact path={lessonPlanPath} component={LessonPlanShow} />
          <Route exact path={`${lessonPlanPath}/edit`} component={LessonPlanEdit} />
        </Switch>
        <div style={styles.tools}>
          <LessonPlanNav />
          <LessonPlanFilter />
        </div>
        <NotificationBar notification={notification} />
      </div>
    );
  }
}

export default connect(state => ({
  isLoading: state.isLoading,
  groups: state.groups,
  notification: state.notification,
}))(LessonPlanLayout);
