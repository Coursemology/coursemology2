import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import moment from 'lib/moment';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import Toggle from 'material-ui/Toggle';
import DateTimePicker from 'lib/components/form/DateTimePicker';

const translations = defineMessages({
  updateFailed: {
    id: 'course.lessonPlan.lessonPlanEdit.updateFailed',
    defaultMessage: 'Update Failed.',
  },
  updateSuccess: {
    id: 'course.lessonPlan.lessonPlanEdit.updateSuccess',
    defaultMessage: "'{title}' was updated.",
  },
});

const sameDate = (a, b) => (!a && !b) || (a && b && moment(a).isSame(b, 'minute'));

class LessonPlanItemEdit extends React.Component {
  static propTypes = {
    item: PropTypes.instanceOf(Immutable.Map).isRequired,
    updateItem: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  shouldComponentUpdate(nextProps) {
    const nextItem = nextProps.item;
    const item = this.props.item;
    const attrList = ['start_at', 'end_at', 'bonus_end_at', 'isUpdating', 'published'];
    for (let i = 0; i < attrList.length; i += 1) {
      if (nextItem.get(attrList[i]) !== item.get(attrList[i])) return true;
    }

    return false;
  }

  render() {
    const { intl, item, updateItem } = this.props;
    const title = item.get('title');
    const startAt = new Date(item.get('start_at'));
    const bonusEndAt = item.get('bonus_end_at') ? new Date(item.get('bonus_end_at')) : undefined;
    const endAt = item.get('end_at') ? new Date(item.get('end_at')) : undefined;
    const itemId = item.get('id');
    const isUpdating = item.get('isUpdating');
    const errorMessage = intl.formatMessage(translations.updateFailed);
    const successMessage = intl.formatMessage(translations.updateSuccess, { title });
    const updateValues = values => (
      updateItem(itemId, values, item.toJS(), successMessage, errorMessage)
    );

    return (
      <tr key={itemId}>
        <td>{ item.get('lesson_plan_item_type').join(': ') }</td>
        <td>
          { title }
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
        <td>
          <DateTimePicker
            name={'bonus_end_at'}
            value={bonusEndAt}
            onChange={(event, newDate) => (
              !sameDate(bonusEndAt, newDate) && updateValues({ bonus_end_at: newDate })
            )}
            disabled={isUpdating}
          />
        </td>
        <td>
          <DateTimePicker
            name={'end_at'}
            value={endAt}
            onChange={(event, newDate) => (
              !sameDate(startAt, newDate) && updateValues({ end_at: newDate })
            )}
            disabled={isUpdating}
          />
        </td>
        <td>
          <Toggle
            toggled={item.get('published')}
            onToggle={(event, isToggled) => updateValues({ published: isToggled })}
            disabled={isUpdating}
          />
        </td>
      </tr>
    );
  }
}

export default injectIntl(LessonPlanItemEdit);
