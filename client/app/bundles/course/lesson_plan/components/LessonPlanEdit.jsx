import React, { PropTypes } from 'react';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

const propTypes = {
  milestoneGroups: PropTypes.array,
  updateItemDateTime: PropTypes.func,
  updateMilestoneDateTime: PropTypes.func,
};

const styles = {
  datePickerTextField: {
    width: 130,
  },
  timePickerTextField: {
    width: 100,
  },
};

class LessonPlanEdit extends React.Component {
  renderMilestone(milestone) {
    const { updateMilestoneDateTime } = this.props;
    const startAt = new Date(milestone.get('start_at'));
    const milestoneId = milestone.get('id');

    return (
      <tr>
        <td />
        <td>
          <h3>
            { milestone.get('title') }
          </h3>
        </td>
        <td>
          <DatePicker
            name="start_at"
            value={startAt}
            textFieldStyle={styles.datePickerTextField}
            onChange={(event, newDate) => updateMilestoneDateTime(milestoneId, newDate, startAt)}
          />
        </td>
        <td>
          <TimePicker
            name="start_at"
            value={startAt}
            textFieldStyle={styles.timePickerTextField}
            onChange={(event, newTime) => updateMilestoneDateTime(milestoneId, startAt, newTime)}
          />
        </td>
        <td />
        <td />
      </tr>
    );
  }

  renderItem(item) {
    const { updateItemDateTime } = this.props;
    const startAt = new Date(item.get('start_at'));
    const endAt = item.get('end_at') ? new Date(item.get('end_at')) : undefined;
    const itemId = item.get('id');

    return (
      <tr key={itemId}>
        <td>{ item.get('lesson_plan_item_type').join(': ') }</td>
        <td>{ item.get('title') }</td>
        <td>
          <DatePicker
            name="start_at"
            value={startAt}
            textFieldStyle={styles.datePickerTextField}
            onChange={(event, newDate) => updateItemDateTime(itemId, 'start_at', newDate, startAt)}
          />
        </td>
        <td>
          <TimePicker
            name="start_at"
            value={startAt}
            textFieldStyle={styles.timePickerTextField}
            onChange={(event, newTime) => updateItemDateTime(itemId, 'start_at', startAt, newTime)}
          />
        </td>
        <td>
          <DatePicker
            name="end_at"
            value={endAt}
            textFieldStyle={styles.datePickerTextField}
            onChange={(event, newDate) => updateItemDateTime(itemId, 'end_at', newDate, endAt)}
          />
        </td>
        <td>
          <TimePicker
            name="end_at"
            value={endAt}
            textFieldStyle={styles.timePickerTextField}
            onChange={(event, newTime) => updateItemDateTime(itemId, 'end_at', endAt, newTime)}
          />
        </td>
      </tr>
    );
  }

  renderGroup(group) {
    return group.items.map(item => this.renderItem(item))
           .unshift(this.renderMilestone(group.milestone));
  }

  render() {
    const { milestoneGroups } = this.props;
    return (
      <table>
        <tbody>
          {
             milestoneGroups.map(group => this.renderGroup(group))
          }
        </tbody>
      </table>
    );
  }
}

LessonPlanEdit.propTypes = propTypes;

export default LessonPlanEdit;
