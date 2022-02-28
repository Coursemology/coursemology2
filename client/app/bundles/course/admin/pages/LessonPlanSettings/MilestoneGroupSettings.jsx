import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { updateLessonPlanSettings } from 'course/admin/actions/lesson-plan-items';
import { initialState as defaultSettings } from 'course/lesson-plan/reducers/flags';

const translations = defineMessages({
  header: {
    id: 'course.admin.lessonPlanSettings.MilestoneGroupSettings.header',
    defaultMessage: 'Milestone Groups Settings',
  },
  explanation: {
    id: 'course.admin.lessonPlanSettings.MilestoneGroupSettings.explanation',
    defaultMessage: 'When lesson plan page is loaded,',
  },
  expandAll: {
    id: 'course.admin.lessonPlanSettings.MilestoneGroupSettings.expandAll',
    defaultMessage: 'Expand all milestone groups',
  },
  expandNone: {
    id: 'course.admin.lessonPlanSettings.MilestoneGroupSettings.expandNone',
    defaultMessage: 'Collapse all milestone groups',
  },
  expandCurrent: {
    id: 'course.admin.lessonPlanSettings.MilestoneGroupSettings.expandCurrent',
    defaultMessage: 'Expand just the current milestone group',
  },
  updateSuccess: {
    id: 'course.admin.lessonPlanSettings.MilestoneGroupSettings.updateSuccess',
    defaultMessage: 'Updated milestone groups settings.',
  },
  updateFailure: {
    id: 'course.admin.lessonPlanSettings.MilestoneGroupSettings.updateFailure',
    defaultMessage: 'Failed to update milestone groups settings.',
  },
});

class MilestoneGroupSettings extends React.Component {
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
      <>
        <h2>
          <FormattedMessage {...translations.header} />
        </h2>
        <p>
          <FormattedMessage {...translations.explanation} />
        </p>
        <RadioGroup
          name="milestonesExpanded"
          value={
            this.props.milestonesExpanded || defaultSettings.milestonesExpanded
          }
          onChange={this.handleUpdate}
        >
          <FormControlLabel
            key="all"
            control={
              <Radio color="primary" style={{ padding: 0, paddingLeft: 12 }} />
            }
            value="all"
            label={<FormattedMessage {...translations.expandAll} />}
          />
          <FormControlLabel
            key="none"
            control={
              <Radio color="primary" style={{ padding: 0, paddingLeft: 12 }} />
            }
            value="none"
            label={<FormattedMessage {...translations.expandNone} />}
          />
          <FormControlLabel
            key="current"
            control={
              <Radio color="primary" style={{ padding: 0, paddingLeft: 12 }} />
            }
            value="current"
            label={<FormattedMessage {...translations.expandCurrent} />}
          />
        </RadioGroup>
      </>
    );
  }
}

MilestoneGroupSettings.propTypes = {
  milestonesExpanded: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  milestonesExpanded:
    state.lessonPlanSettings.component_settings.milestones_expanded,
}))(MilestoneGroupSettings);
