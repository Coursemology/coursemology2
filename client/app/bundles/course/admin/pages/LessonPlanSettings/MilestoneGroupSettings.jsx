import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import PropTypes from 'prop-types';

import { initialState as defaultSettings } from 'course/lesson-plan/reducers/flags';
import Subsection from 'lib/components/core/layouts/Subsection';

import { updateLessonPlanSettings } from './operations';

const translations = defineMessages({
  header: {
    id: 'course.admin.LessonPlanSettings.MilestoneGroupSettings.header',
    defaultMessage: 'Milestone Groups Settings',
  },
  explanation: {
    id: 'course.admin.LessonPlanSettings.MilestoneGroupSettings.explanation',
    defaultMessage: 'When lesson plan page is loaded,',
  },
  expandAll: {
    id: 'course.admin.LessonPlanSettings.MilestoneGroupSettings.expandAll',
    defaultMessage: 'Expand all milestone groups',
  },
  expandNone: {
    id: 'course.admin.LessonPlanSettings.MilestoneGroupSettings.expandNone',
    defaultMessage: 'Collapse all milestone groups',
  },
  expandCurrent: {
    id: 'course.admin.LessonPlanSettings.MilestoneGroupSettings.expandCurrent',
    defaultMessage: 'Expand just the current milestone group',
  },
  updateSuccess: {
    id: 'course.admin.LessonPlanSettings.MilestoneGroupSettings.updateSuccess',
    defaultMessage: 'Updated milestone groups settings.',
  },
  updateFailure: {
    id: 'course.admin.LessonPlanSettings.MilestoneGroupSettings.updateFailure',
    defaultMessage: 'Failed to update milestone groups settings.',
  },
});

class MilestoneGroupSettings extends Component {
  handleUpdate = (_, milestonesExpanded) => {
    const { dispatch } = this.props;
    const payload = {
      lesson_plan_component_settings: {
        milestones_expanded: milestonesExpanded,
      },
    };
    const successMessage = <FormattedMessage {...translations.updateSuccess} />;
    const failureMessage = <FormattedMessage {...translations.updateFailure} />;
    dispatch(updateLessonPlanSettings(payload, successMessage, failureMessage));
  };

  render() {
    return (
      <Subsection
        subtitle={<FormattedMessage {...translations.explanation} />}
        title={<FormattedMessage {...translations.header} />}
      >
        <RadioGroup
          name="milestonesExpanded"
          onChange={this.handleUpdate}
          value={
            this.props.milestonesExpanded || defaultSettings.milestonesExpanded
          }
        >
          <FormControlLabel
            key="all"
            control={<Radio className="p-0 px-4" />}
            label={<FormattedMessage {...translations.expandAll} />}
            value="all"
          />
          <FormControlLabel
            key="none"
            control={<Radio className="p-0 px-4" />}
            label={<FormattedMessage {...translations.expandNone} />}
            value="none"
          />
          <FormControlLabel
            key="current"
            control={<Radio className="p-0 px-4" />}
            label={<FormattedMessage {...translations.expandCurrent} />}
            value="current"
          />
        </RadioGroup>
      </Subsection>
    );
  }
}

MilestoneGroupSettings.propTypes = {
  milestonesExpanded: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  milestonesExpanded:
    state.courseSettings.lessonPlanSettings.component_settings
      .milestones_expanded,
}))(MilestoneGroupSettings);
