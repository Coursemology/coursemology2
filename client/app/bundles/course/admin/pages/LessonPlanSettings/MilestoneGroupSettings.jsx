import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
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
  static propTypes = {
    milestonesExpanded: PropTypes.string,
    dispatch: PropTypes.func.isRequired,
  }

  handleUpdate = (_, milestonesExpanded) => {
    const { dispatch } = this.props;
    const payload = { lesson_plan_component_settings: { milestones_expanded: milestonesExpanded } };
    const successMessage = <FormattedMessage {...translations.updateSuccess} />;
    const failureMessage = <FormattedMessage {...translations.updateFailure} />;
    dispatch(updateLessonPlanSettings(payload, successMessage, failureMessage));
  }

  render() {
    return (
      <React.Fragment>
        <h2><FormattedMessage {...translations.header} /></h2>
        <p><FormattedMessage {...translations.explanation} /></p>
        <RadioButtonGroup
          name="milestonesExpanded"
          valueSelected={this.props.milestonesExpanded || defaultSettings.milestonesExpanded}
          onChange={this.handleUpdate}
        >
          <RadioButton
            value="all"
            label={<FormattedMessage {...translations.expandAll} />}
          />
          <RadioButton
            value="none"
            label={<FormattedMessage {...translations.expandNone} />}
          />
          <RadioButton
            value="current"
            label={<FormattedMessage {...translations.expandCurrent} />}
          />
        </RadioButtonGroup>
      </React.Fragment>
    );
  }
}

export default connect(state => ({
  milestonesExpanded: state.lessonPlanSettings.component_settings.milestones_expanded,
}))(MilestoneGroupSettings);
