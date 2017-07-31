import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, Route, Switch } from 'react-router-dom';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import { Card, CardText } from 'material-ui/Card';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import NotificationPopup from 'lib/containers/NotificationPopup';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import TitleBar from 'lib/components/TitleBar';
import { fetchLessonPlan } from 'course/lesson-plan/actions';
import LessonPlanShow from 'course/lesson-plan/pages/LessonPlanShow';
import LessonPlanEdit from 'course/lesson-plan/pages/LessonPlanEdit';
import LessonPlanFilter from 'course/lesson-plan/containers/LessonPlanFilter';
import LessonPlanNav from 'course/lesson-plan/containers/LessonPlanNav';
import MilestoneFormDialog from 'course/lesson-plan/containers/MilestoneFormDialog';
import EventFormDialog from 'course/lesson-plan/containers/EventFormDialog';
import ExitEditModeButton from './ExitEditModeButton';
import EnterEditModeButton from './EnterEditModeButton';
import NewMilestoneButton from './NewMilestoneButton';
import NewEventButton from './NewEventButton';

const translations = defineMessages({
  empty: {
    id: 'course.lessonPlan.LessonPlanLayout.empty',
    defaultMessage: 'The lesson plan is empty.',
  },
  lessonPlan: {
    id: 'course.lessonPlan.LessonPlanLayout.lessonPlan',
    defaultMessage: 'Lesson Plan',
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

const lessonPlanPath = '/courses/:courseId/lesson_plan';

class LessonPlanLayout extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      milestone: PropTypes.object,
      items: PropTypes.array,
    })).isRequired,
    canManageLessonPlan: PropTypes.bool.isRequired,

    dispatch: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchLessonPlan());
  }

  renderHeader() {
    if (!this.props.canManageLessonPlan) { return null; }

    return (
      <Card>
        <CardText>
          <Route exact path={lessonPlanPath} component={EnterEditModeButton} />
          <Route exact path={`${lessonPlanPath}/edit`} component={ExitEditModeButton} />
          <NewMilestoneButton />
          <Route path={lessonPlanPath} component={NewEventButton} />
        </CardText>
      </Card>
    );
  }

  renderBody() {
    const { isLoading, groups } = this.props;

    if (isLoading) { return <LoadingIndicator />; }

    if (!groups || groups.length < 1) {
      return <Subheader><FormattedMessage {...translations.empty} /></Subheader>;
    }

    return (
      <Switch>
        <Route exact path={lessonPlanPath} component={LessonPlanShow} />
        <Route exact path={`${lessonPlanPath}/edit`} component={LessonPlanEdit} />
      </Switch>
    );
  }

  render() {
    return (
      <div style={styles.mainBody}>
        <TitleBar title={<FormattedMessage {...translations.lessonPlan} />} />
        { this.renderHeader() }
        { this.renderBody() }
        <div style={styles.tools}>
          <LessonPlanNav />
          <LessonPlanFilter />
        </div>
        <NotificationPopup />
        <DeleteConfirmation />
        <EventFormDialog />
        <MilestoneFormDialog />
      </div>
    );
  }
}

export default withRouter(connect(state => ({
  isLoading: state.lessonPlan.isLoading,
  groups: state.lessonPlan.groups,
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(LessonPlanLayout));
