/* eslint-disable react/no-danger */
import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { Glyphicon, ButtonGroup } from 'react-bootstrap';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import DeleteButton from 'lib/components/form/DeleteButton';
import EditButton from 'lib/components/form/EditButton';
import isScreenXs from 'lib/helpers/viewport';
import styles from './LessonPlanItem.scss';

const propTypes = {
  item: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  lessonPlanItemTypeKey: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const translations = defineMessages({
  deleteItemConfirmation: {
    id: 'course.lessonPlan.lessonPlanItem.deleteConfirmation',
    defaultMessage: 'Delete Lesson Plan Item?',
    description: 'Confirmation message for Lesson Plan Item delete button',
  },
});

const shortDateFormat = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
};

const standardDateFormat = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
};

const shortTimeFormat = {
  hour12: false,
};

class LessonPlanItem extends React.Component {
  renderTypeTag() {
    const { item } = this.props;
    return (
      <span className={styles.itemTypeTag}>
        { this.props.lessonPlanItemTypeKey(item.get('lesson_plan_item_type')) }
      </span>
    );
  }

  renderTitle() {
    const { item } = this.props;
    return (
      <div className={styles.spaceBetween}>
        <a>
          { item.get('published') ? '' : <Glyphicon glyph="ban-circle" className={styles.glyph} /> }
          <b>{ item.get('title') }</b>
        </a>
        <span className="hidden-xs">
          { this.renderTypeTag() }
        </span>
      </div>
    );
  }

  /*
   * Renders the date/time range of the item in one of the following formats:
   * - August 18, 2017, 12:00 PM
   * - November 24, 2016, 5:00 PM - 7:00 PM
   * - November 10, 2016, 10:00 AM - November 11, 2016, 11:00 AM
   * Output varies depending on locale.
   */
  renderDateTimeRange() {
    const { item, intl } = this.props;
    const useShortFormat = isScreenXs();
    const dateFormat = useShortFormat ? shortDateFormat : standardDateFormat;
    const timeFormat = useShortFormat ? shortTimeFormat : {};
    const startDateTime = new Date(item.get('start_at'));
    const startDate = intl.formatDate(startDateTime, dateFormat);
    const startTime = intl.formatTime(startDateTime, timeFormat);
    let outputString = `${startDate}, ${startTime}`;

    if (item.has('end_at') && item.get('end_at')) {
      outputString += ' - ';
      const endDateTime = Date.parse(item.get('end_at'));
      const endDate = intl.formatDate(endDateTime, dateFormat);
      const endTime = intl.formatTime(endDateTime, timeFormat);

      if (startDate === endDate) {
        outputString += endTime;
      } else {
        outputString += `${endDate}, ${endTime}`;
      }
    }

    return <span>{outputString}</span>;
  }

  renderLocation() {
    const { item } = this.props;
    if (!item.has('location') || !item.get('location')) {
      return '';
    }
    const location = item.get('location');
    return (
      <div>
        <FormattedMessage
          id="course.lessonPlan.lessonPlanItem.location"
          description="Location text for the lesson plan event."
          defaultMessage="Location: {location}"
          values={{ location }}
        />
      </div>
    );
  }

  renderButtons() {
    const { item, intl } = this.props;
    return (
      <ButtonGroup>
        { item.has('edit_path') ? <EditButton path={item.get('edit_path')} /> : [] }
        {
          item.has('delete_path') ?
            <DeleteButton
              path={item.get('delete_path')}
              confirmationMessage={intl.formatMessage(translations.deleteItemConfirmation)}
            /> : []
        }
      </ButtonGroup>
    );
  }

  renderDescription() {
    const { item } = this.props;
    if (!item.has('description') || !item.get('description')) {
      return '';
    }
    return (
      <div dangerouslySetInnerHTML={{ __html: item.get('description') }} />
    );
  }

  render() {
    const { item } = this.props;
    return (
      <div id={`lesson-plan-item-${item.get('id')}`}>
        <div className={`lesson-plan-item-title-bar ${styles.lessonPlanItemTitleBar}`}>
          { this.renderTitle() }
        </div>
        <div className={styles.card}>
          <div className={styles.spaceBetween}>
            <div className={styles.itemDetails}>
              <div className="visible-xs">
                { this.renderTypeTag() }
              </div>
              { this.renderDateTimeRange() }
              { this.renderLocation() }
            </div>
            <div>
              { this.renderButtons() }
            </div>
          </div>
          { this.renderDescription() }
        </div>
      </div>
    );
  }
}

LessonPlanItem.propTypes = propTypes;

export default injectIntl(LessonPlanItem);
