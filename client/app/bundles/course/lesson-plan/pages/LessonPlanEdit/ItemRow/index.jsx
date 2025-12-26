import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Link from 'lib/components/core/Link';

import { fields } from '../../../constants';
import TranslatedItemType from '../../../containers/TranslatedItemType';
import { updateItem } from '../../../operations';

import DateCell from './DateCell';
import PublishedCell from './PublishedCell';

const translations = defineMessages({
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanEdit.ItemRow.updateSuccess',
    defaultMessage: '"{title}" was updated.',
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

class ItemRow extends Component {
  updateItem = (payload) => {
    const { id, title, dispatch } = this.props;
    const successMessage = (
      <FormattedMessage {...translations.updateSuccess} values={{ title }} />
    );
    const failureMessage = (
      <FormattedMessage {...translations.updateFailed} values={{ title }} />
    );
    dispatch(updateItem(id, payload, successMessage, failureMessage));
  };

  updatePublished = (_, isToggled) => this.updateItem({ published: isToggled });

  render() {
    const {
      type,
      title,
      startAt,
      bonusEndAt,
      endAt,
      published,
      visibility,
      columnsVisible,
      itemPath,
    } = this.props;

    const isHidden = !visibility[type];
    if (isHidden) {
      return null;
    }

    const dateProps = {
      startAt,
      bonusEndAt,
      endAt,
      updateItem: this.updateItem,
    };

    return (
      <tr>
        {columnsVisible[fields.ITEM_TYPE] ? (
          <td>
            <TranslatedItemType type={type} />
          </td>
        ) : null}
        <td>
          <Link to={itemPath}>{title}</Link>
        </td>
        {columnsVisible[fields.START_AT] ? (
          <DateCell fieldName="start_at" fieldValue={startAt} {...dateProps} />
        ) : null}
        {columnsVisible[fields.BONUS_END_AT] ? (
          <DateCell
            fieldName="bonus_end_at"
            fieldValue={bonusEndAt}
            {...dateProps}
          />
        ) : null}
        {columnsVisible[fields.END_AT] ? (
          <DateCell fieldName="end_at" fieldValue={endAt} {...dateProps} />
        ) : null}
        {columnsVisible[fields.PUBLISHED] ? (
          <PublishedCell
            onToggle={this.updatePublished}
            published={published}
          />
        ) : null}
      </tr>
    );
  }
}

ItemRow.propTypes = {
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
};

export default connect(({ lessonPlan }) => ({
  visibility: lessonPlan.lessonPlan.visibilityByType,
  columnsVisible: lessonPlan.flags.editPageColumnsVisible,
}))(ItemRow);
