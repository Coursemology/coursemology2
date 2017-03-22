import React, { PropTypes } from 'react';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import moment from 'lib/moment';
import Snackbar from 'material-ui/Snackbar';
import DateTimePicker from 'lib/components/form/DateTimePicker';
import LessonPlanFilter from '../containers/LessonPlanFilter';
import LessonPlanItemEdit from './LessonPlanItemEdit';
import './LessonPlanEdit.scss';
import { constants } from '../constants';

const translations = defineMessages({
  type: {
    id: 'course.lessonPlan.lessonPlanEdit.type',
    defaultMessage: 'Type',
  },
  title: {
    id: 'course.lessonPlan.lessonPlanEdit.title',
    defaultMessage: 'Title',
  },
  startTime: {
    id: 'course.lessonPlan.lessonPlanEdit.startTime',
    defaultMessage: 'Start Time',
  },
  bonusEndTime: {
    id: 'course.lessonPlan.lessonPlanEdit.bonusEndTime',
    defaultMessage: 'Bonus End Time',
  },
  endTime: {
    id: 'course.lessonPlan.lessonPlanEdit.endTime',
    defaultMessage: 'End Time',
  },
  published: {
    id: 'course.lessonPlan.lessonPlanEdit.published',
    defaultMessage: 'Published',
  },
  updateFailed: {
    id: 'course.lessonPlan.lessonPlanEdit.updateFailed',
    defaultMessage: 'Update Failed.',
  },
  updateSuccess: {
    id: 'course.lessonPlan.lessonPlanEdit.updateSuccess',
    defaultMessage: "'{title}' was updated.",
  },
});

const propTypes = {
  milestoneGroups: PropTypes.array,
  updateItem: PropTypes.func,
  updateMilestone: PropTypes.func,
  notification: PropTypes.string,
  intl: intlShape.isRequired,
};

const styles = {
  filter: {
    bottom: 12,
    position: 'fixed',
    right: 24,
  },
  lessonPlanEditDiv: {
    marginBottom: 100,
  },
};

const sameDate = (a, b) => (!a && !b) || (a && b && moment(a).isSame(b, 'minute'));

class LessonPlanEdit extends React.Component {
  renderMilestone(milestone) {
    const { intl, updateMilestone } = this.props;
    const startAt = new Date(milestone.get('start_at'));
    const milestoneId = milestone.get('id');
    const title = milestone.get('title');
    const isUpdating = milestone.get('isUpdating');
    const errorMessage = intl.formatMessage(translations.updateFailed);
    const successMessage = intl.formatMessage(translations.updateSuccess, { title });
    const updateValues = values => (
      updateMilestone(milestoneId, values, milestone.toJS(), successMessage, errorMessage)
    );

    if (milestone.get('id') === constants.PRIOR_ITEMS_MILESTONE) {
      return [];
    }

    return (
      <tr>
        <td colSpan={2}>
          <h3>
            { title }
          </h3>
        </td>
        <td>
          <DateTimePicker
            name={'start_at'}
            value={startAt}
            onChange={(event, newDate) => (
              !sameDate(startAt, newDate) && updateValues({ start_at: newDate })
            )}
            disabled={isUpdating}
          />
        </td>
        <td />
        <td />
        <td />
      </tr>
    );
  }

  renderGroup(group) {
    const groupNodes = group.items.map(item => (
      <LessonPlanItemEdit item={item} updateItem={this.props.updateItem} />
    ));
    groupNodes.unshift(this.renderMilestone(group.milestone));
    return groupNodes;
  }

  render() {
    const { intl, milestoneGroups, notification } = this.props;
    return (
      <div style={styles.lessonPlanEditDiv}>
        <table>
          <thead>
            <tr>
              <th>{intl.formatMessage(translations.type)}</th>
              <th>{intl.formatMessage(translations.title)}</th>
              <th>{intl.formatMessage(translations.startTime)}</th>
              <th>{intl.formatMessage(translations.bonusEndTime)}</th>
              <th>{intl.formatMessage(translations.endTime)}</th>
              <th>{intl.formatMessage(translations.published)}</th>
            </tr>
          </thead>
          <tbody>
            {
               milestoneGroups.map(group => this.renderGroup(group))
            }
          </tbody>
        </table>
        <div style={styles.filter}>
          <LessonPlanFilter />
        </div>
        <Snackbar
          open={notification !== ''}
          message={notification}
        />
      </div>
    );
  }
}

LessonPlanEdit.propTypes = propTypes;

export default injectIntl(LessonPlanEdit);
