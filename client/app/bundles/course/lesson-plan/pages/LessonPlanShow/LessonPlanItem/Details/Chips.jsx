import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import Block from '@mui/icons-material/Block';
import DateRange from '@mui/icons-material/DateRange';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Room from '@mui/icons-material/Room';
import { Avatar, Chip } from '@mui/material';
import { red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import moment, { formatShortDateTime, formatShortTime } from 'lib/moment';

const translations = defineMessages({
  notPublished: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.Details.Chip.notPublished',
    defaultMessage: 'Not Published',
  },
});

const styles = {
  avatar: {
    color: '#fff',
  },
  chip: {
    margin: 4,
  },
  chipIcon: {
    fontSize: '1.8rem',
  },
  chipsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: 16,
    paddingRight: 16,
  },
  notPublishedAvatar: {
    color: '#fff',
    backgroundColor: red[700],
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
  if (!start.isValid()) {
    return '';
  }

  const end = moment(endAt);
  if (!end.isValid()) {
    return formatShortDateTime(start);
  }

  if (end.isSame(start, 'day')) {
    return `${formatShortDateTime(start)} - ${formatShortTime(end)}`;
  }
  return `${formatShortDateTime(start)} - ${formatShortDateTime(end)}`;
};

class Chips extends Component {
  renderDateTimeRangeChip() {
    const { startAt, endAt } = this.props;
    return (
      <Chip
        avatar={
          <Avatar style={styles.avatar}>
            <DateRange style={styles.chipIcon} />
          </Avatar>
        }
        label={formatDateRange(startAt, endAt)}
        style={styles.chip}
      />
    );
  }

  renderLocationChip() {
    const { location } = this.props;
    if (!location) {
      return null;
    }
    return (
      <Chip
        avatar={
          <Avatar style={styles.avatar}>
            <Room />
          </Avatar>
        }
        label={location}
        style={styles.chip}
      />
    );
  }

  renderNotPublishedChip() {
    if (this.props.published) {
      return null;
    }
    return (
      <Chip
        avatar={
          <Avatar style={styles.notPublishedAvatar}>
            <Block />
          </Avatar>
        }
        label={<FormattedMessage {...translations.notPublished} />}
        style={styles.chip}
      />
    );
  }

  renderTypeTagChip() {
    const { itemType } = this.props;
    return (
      <Chip
        avatar={
          <Avatar style={styles.avatar}>
            <InfoOutlined />
          </Avatar>
        }
        label={itemType}
        style={styles.chip}
      />
    );
  }

  render() {
    return (
      <div style={styles.chipsWrapper}>
        {this.renderNotPublishedChip()}
        {this.renderTypeTagChip()}
        {this.renderDateTimeRangeChip()}
        {this.renderLocationChip()}
      </div>
    );
  }
}

Chips.propTypes = {
  published: PropTypes.bool,
  itemType: PropTypes.string.isRequired,
  startAt: PropTypes.string.isRequired,
  endAt: PropTypes.string,
  location: PropTypes.string,
};

export default Chips;
