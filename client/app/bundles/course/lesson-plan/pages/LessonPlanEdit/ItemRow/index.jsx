import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { updateItem } from 'course/lesson-plan/actions';
import { fields } from 'course/lesson-plan/constants';
import DateCell from './DateCell';
import PublishedCell from './PublishedCell';

const translations = defineMessages({
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanEdit.ItemRow.updateSuccess',
    defaultMessage: "'{title}' was updated.",
  },
  updateFailed: {
    id: 'course.lessonPlan.LessonPlanEdit.ItemRow.updateFailed',
    defaultMessage: 'Failed to update {title}.',
  },
});

const datePropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.instanceOf(Date),
]);

class ItemRow extends React.Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    startAt: datePropType.isRequired,
    endAt: datePropType,
    bonusEndAt: datePropType,
    published: PropTypes.bool.isRequired,
    visibility: PropTypes.shape({}).isRequired,
    columnsVisible: PropTypes.shape({}).isRequired,
    itemPath: PropTypes.string,

    dispatch: PropTypes.func.isRequired,
  }

  updateItem = (payload) => {
    const { id, title, dispatch } = this.props;
    const successMessage = <FormattedMessage {...translations.updateSuccess} values={{ title }} />;
    const failureMessage = <FormattedMessage {...translations.updateFailed} values={{ title }} />;
    dispatch(updateItem(id, payload, successMessage, failureMessage));
  }

  updatePublished = (_, isToggled) => this.updateItem({ published: isToggled })

  render() {
    const {
      type, title, startAt, bonusEndAt, endAt, published, visibility, columnsVisible, itemPath,
    } = this.props;

    const isHidden = !visibility[type];
    if (isHidden) { return null; }

    const dateProps = { startAt, bonusEndAt, endAt, updateItem: this.updateItem };

    return (
      <tr>
        { columnsVisible[fields.ITEM_TYPE] ? <td>{ type }</td> : null }
        <td>{ itemPath ? <a href={itemPath}>{ title }</a> : title }</td>
        {
          columnsVisible[fields.START_AT] ?
            <DateCell fieldName="start_at" fieldValue={startAt} {...dateProps} /> : null
        }
        {
          columnsVisible[fields.BONUS_END_AT] ?
            <DateCell fieldName="bonus_end_at" fieldValue={bonusEndAt} {...dateProps} /> : null
        }
        {
          columnsVisible[fields.END_AT] ?
            <DateCell fieldName="end_at" fieldValue={endAt} {...dateProps} /> : null
        }
        {
          columnsVisible[fields.PUBLISHED] ?
            <PublishedCell published={published} onToggle={this.updatePublished} /> : null
        }
      </tr>
    );
  }
}

export default connect(state => ({
  visibility: state.lessonPlan.visibilityByType,
  columnsVisible: state.flags.editPageColumnsVisible,
}))(ItemRow);
