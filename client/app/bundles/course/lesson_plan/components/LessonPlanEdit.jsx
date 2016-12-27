import React, { PropTypes } from 'react';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';

const propTypes = {
  milestoneGroups: PropTypes.array,
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
  static renderItem(item) {
    const startAt = new Date(item.get('start_at'));
    const endAt = item.get('end_at') ? new Date(item.get('end_at')) : undefined;
    return (
      <tr key={item.get('id')}>
        <td>{ item.get('lesson_plan_item_type').join(': ') }</td>
        <td>{ item.get('title') }</td>
        <td>
          <DatePicker
            name="start_at"
            value={startAt}
            textFieldStyle={styles.datePickerTextField}
          />
        </td>
        <td>
          <TimePicker
            name="start_at"
            value={startAt}
            textFieldStyle={styles.timePickerTextField}
          />
        </td>
        <td>
          <DatePicker
            name="end_at"
            value={endAt}
            textFieldStyle={styles.datePickerTextField}
          />
        </td>
        <td>
          <TimePicker
            name="end_at"
            value={endAt}
            textFieldStyle={styles.timePickerTextField}
          />
        </td>
      </tr>
    );
  }

  static renderMilestone(milestone) {
    const startAt = new Date(milestone.get('start_at'));
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
          />
        </td>
        <td>
          <TimePicker
            name="start_at"
            value={startAt}
            textFieldStyle={styles.timePickerTextField}
          />
        </td>
        <td />
        <td />
      </tr>
    );
  }

  static renderGroup(group) {
    return group.items.map(item => LessonPlanEdit.renderItem(item))
           .unshift(LessonPlanEdit.renderMilestone(group.milestone));
  }

  render() {
    const { milestoneGroups } = this.props;
    return (
      <table>
        <tbody>
          {
             milestoneGroups.map(group => LessonPlanEdit.renderGroup(group))
          }
        </tbody>
      </table>
    );
  }
}

LessonPlanEdit.propTypes = propTypes;

export default LessonPlanEdit;
