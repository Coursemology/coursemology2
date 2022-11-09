import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { ListSubheader } from '@mui/material';
import PropTypes from 'prop-types';

import { fetchLessonPlan } from 'course/lesson-plan/actions';
import EventFormDialog from 'course/lesson-plan/containers/EventFormDialog';
import LessonPlanFilter from 'course/lesson-plan/containers/LessonPlanFilter';
import LessonPlanNav from 'course/lesson-plan/containers/LessonPlanNav';
import MilestoneFormDialog from 'course/lesson-plan/containers/MilestoneFormDialog';
import LessonPlanEdit from 'course/lesson-plan/pages/LessonPlanEdit';
import LessonPlanShow from 'course/lesson-plan/pages/LessonPlanShow';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import NotificationPopup from 'lib/containers/NotificationPopup';
import { lessonPlanTypesGroups } from 'lib/types';

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

class LessonPlanLayout extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchLessonPlan());
  }

  renderBody() {
    const { isLoading, groups } = this.props;

    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!groups || groups.length < 1) {
      return (
        <ListSubheader disableSticky={true}>
          <FormattedMessage {...translations.empty} />
        </ListSubheader>
      );
    }

    return (
      <Routes>
        <Route
          element={<LessonPlanShow />}
          exact={true}
          path={lessonPlanPath}
        />
        <Route
          element={<LessonPlanEdit />}
          exact={true}
          path={`${lessonPlanPath}/edit`}
        />
      </Routes>
    );
  }

  render() {
    return (
      <div style={styles.mainBody}>
        <PageHeader title={<FormattedMessage {...translations.lessonPlan} />} />
        {this.renderBody()}
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

LessonPlanLayout.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  groups: lessonPlanTypesGroups.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  isLoading: state.lessonPlan.isLoading,
  groups: state.lessonPlan.groups,
}))(LessonPlanLayout);
