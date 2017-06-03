import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import Block from 'material-ui/svg-icons/content/block';
import Room from 'material-ui/svg-icons/action/room';
import DateRange from 'material-ui/svg-icons/action/date-range';
import InfoOutline from 'material-ui/svg-icons/action/info-outline';
import { red700 } from 'material-ui/styles/colors';
import moment, { shortDateTime, shortTime } from 'lib/moment';

const translations = defineMessages({
  notPublished: {
    id: 'course.lessonPlan.LessonPlanItem.Details.Chip.notPublished',
    defaultMessage: 'Not Published',
  },
});

const styles = {
  chip: {
    margin: 4,
  },
  chipsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: 16,
    paddingRight: 16,
  },
};

/*
 * Returns a string representing a date/time range in one of the following formats:
 * - ""  if startAt does not represent a valid date
 * - "18-08-2017 12:00"  if no valid endAt is provided
 * - "18-08-2017 17:00 - 19:00" if endAt falls on the same day as startAt
 * - "18-08-2017 17:00 - 19-08-2017 19:00" if startAt and endAt are on different days
 *
 * @param {String | Date} startAt
 * @param {String | Date} endAt
 * @return {String} the formatted date range
 */
export const formatDateRange = (startAt, endAt) => {
  const start = moment(startAt);
  if (!start.isValid()) { return ''; }

  const end = moment(endAt);
  if (!end.isValid()) {
    return start.format(shortDateTime);
  }

  if (end.isSame(start, 'day')) {
    return `${start.format(shortDateTime)} - ${end.format(shortTime)}`;
  }
  return `${start.format(shortDateTime)} - ${end.format(shortDateTime)}`;
};

class Chips extends React.Component {
  static propTypes = {
    published: PropTypes.bool,
    itemType: PropTypes.string.isRequired,
    startAt: PropTypes.string.isRequired,
    endAt: PropTypes.string,
    location: PropTypes.string,
  }

  renderNotPublishedChip() {
    if (this.props.published) { return null; }
    return (
      <Chip style={styles.chip}>
        <Avatar icon={<Block />} backgroundColor={red700} />
        <FormattedMessage {...translations.notPublished} />
      </Chip>
    );
  }

  renderTypeTagChip() {
    const { itemType } = this.props;
    return (
      <Chip style={styles.chip}>
        <Avatar icon={<InfoOutline />} />
        { itemType }
      </Chip>
    );
  }

  renderDateTimeRangeChip() {
    const { startAt, endAt } = this.props;
    return (
      <Chip style={styles.chip}>
        <Avatar icon={<DateRange />} />
        { formatDateRange(startAt, endAt) }
      </Chip>
    );
  }

  renderLocationChip() {
    const { location } = this.props;
    if (!location) { return null; }
    return (
      <Chip style={styles.chip}>
        <Avatar icon={<Room />} />
        { location }
      </Chip>
    );
  }

  render() {
    return (
      <div style={styles.chipsWrapper}>
        { this.renderNotPublishedChip() }
        { this.renderTypeTagChip() }
        { this.renderDateTimeRangeChip() }
        { this.renderLocationChip() }
      </div>
    );
  }
}

export default Chips;
