import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { ListSubheader } from '@mui/material';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import { lessonPlanTypesGroups } from 'lib/types';

import { fetchLessonPlan } from '../../operations';
import translations from '../../translations';
import EventFormDialog from '../EventFormDialog';
import LessonPlanFilter from '../LessonPlanFilter';
import LessonPlanNav from '../LessonPlanNav';
import MilestoneFormDialog from '../MilestoneFormDialog';

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

class LessonPlanLayout extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchLessonPlan());
  }

  render() {
    const { isLoading, groups } = this.props;

    if (isLoading) return <LoadingIndicator />;

    if (!groups || groups.length < 1)
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.empty} />
        </ListSubheader>
      );

    return (
      <div style={styles.mainBody}>
        <Outlet />

        <div style={styles.tools}>
          <LessonPlanNav />
          <LessonPlanFilter />
        </div>

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
  children: PropTypes.node.isRequired,
};

const handle = translations.lessonPlan;

export default Object.assign(
  connect(({ lessonPlan }) => ({
    isLoading: lessonPlan.lessonPlan.isLoading,
    groups: lessonPlan.lessonPlan.groups,
  }))(LessonPlanLayout),
  { handle },
);
