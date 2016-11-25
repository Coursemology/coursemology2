/* eslint-disable react/no-danger, jsx-a11y/no-static-element-interactions */
import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { Collapse, Glyphicon, ButtonGroup } from 'react-bootstrap';
import { FormattedDate, FormattedTime, FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import DeleteButton from 'lib/components/form/DeleteButton';
import EditButton from 'lib/components/form/EditButton';
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

class LessonPlanItem extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      open: false,
    };
  }

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
          <Glyphicon
            glyph={`chevron-${this.state.open ? 'down' : 'right'}`}
            className={styles.glyph}
          />
          { item.get('draft') ? <Glyphicon glyph="ban-circle" className={styles.glyph} /> : '' }
          <b>{ item.get('title') }</b>
        </a>
        <span className="hidden-xs">
          { this.renderTypeTag() }
        </span>
      </div>
    );
  }

  renderStartAt() {
    const { item } = this.props;
    const startTime = item.get('start_at');
    return (
      <div>
        <FormattedMessage
          id="course.lessonPlan.lessonPlanItem.startAt"
          description="Start date and time text for lesson plan item."
          defaultMessage="Start: {date} {time}"
          values={{
            date: <FormattedDate
              value={new Date(startTime)}
              year="numeric"
              month="long"
              day="2-digit"
            />,
            time: <FormattedTime value={new Date(startTime)} />,
          }}
        />
      </div>
    );
  }

  renderEndAt() {
    const { item } = this.props;
    if (!item.has('end_at') || !item.get('end_at')) {
      return '';
    }
    const endTime = Date.parse(item.get('end_at'));
    return (
      <div>
        <FormattedMessage
          id="course.lessonPlan.lessonPlanItem.endAt"
          description="End date and time text for lesson plan item."
          defaultMessage="End: {date} {time}"
          values={{
            date: <FormattedDate
              value={new Date(endTime)}
              year="numeric"
              month="long"
              day="2-digit"
            />,
            time: <FormattedTime value={new Date(endTime)} />,
          }}
        />
      </div>
    );
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

  render() {
    const { item } = this.props;
    return (
      <div id={`lesson-plan-item-${item.get('id')}`}>
        <div
          onClick={() => this.setState({ open: !this.state.open })}
          className={`lesson-plan-item-title-bar ${styles.lessonPlanItemTitleBar}`}
        >
          { this.renderTitle() }
        </div>
        <Collapse in={this.state.open}>
          <div>
            <div onClick={() => this.setState({ open: !this.state.open })} className={styles.card}>
              <div className={styles.spaceBetween}>
                <div className={styles.itemDetails}>
                  <div className="visible-xs">
                    { this.renderTypeTag() }
                  </div>
                  { this.renderStartAt() }
                  { this.renderEndAt() }
                  { this.renderLocation() }
                </div>
                <div>
                  { this.renderButtons() }
                </div>
              </div>
              <div dangerouslySetInnerHTML={{ __html: item.get('description') }} />
            </div>
          </div>
        </Collapse>
      </div>
    );
  }
}

LessonPlanItem.propTypes = propTypes;

export default injectIntl(LessonPlanItem);
