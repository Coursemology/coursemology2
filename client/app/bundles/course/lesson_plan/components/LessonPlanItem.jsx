/* eslint-disable react/no-danger */
import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { injectIntl, defineMessages } from 'react-intl';
import { Card, CardText, CardTitle, CardActions } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import Block from 'material-ui/svg-icons/content/block';
import Room from 'material-ui/svg-icons/action/room';
import DateRange from 'material-ui/svg-icons/action/date-range';
import InfoOutline from 'material-ui/svg-icons/action/info-outline';
import Description from 'material-ui/svg-icons/action/description';
import FlatButton from 'material-ui/FlatButton';
import isScreenXs from 'lib/helpers/viewport';

const propTypes = {
  item: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const translations = defineMessages({
  notPublished: {
    id: 'course.lessonPlan.lessonPlanItem.notPublished',
    defaultMessage: 'Not Published',
  },
  deleteItemConfirmation: {
    id: 'course.lessonPlan.lessonPlanItem.deleteConfirmation',
    defaultMessage: 'Delete Lesson Plan Item?',
    description: 'Confirmation message for Lesson Plan Item delete button',
  },
  editItem: {
    id: 'course.lessonPlan.lessonPlanItem.editEvent',
    defaultMessage: 'Edit Item',
  },
  deleteItem: {
    id: 'course.lessonPlan.lessonPlanItem.deleteEvent',
    defaultMessage: 'Delete Item',
  },
});

const styles = {
  chip: {
    margin: 4,
  },
  chipsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  card: {
    marginBottom: 15,
  },
};

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
  renderMaterials() {
    const { item } = this.props;
    if (!item.has('materials') || !item.get('materials')) {
      return '';
    }
    return (
      <CardText>
        <List>
          {
            item.get('materials').map(material =>
              <ListItem
                key={material.get('name')}
                primaryText={material.get('name')}
                leftIcon={<Description />}
                href={material.get('url')}
              />
            )
          }
        </List>
      </CardText>
    );
  }

  renderTitle() {
    const { item } = this.props;
    if (!item.has('item_path') || !item.get('item_path')) {
      return item.get('title');
    }
    return (
      <a href={item.get('item_path')}>
        { item.get('title') }
      </a>
    );
  }

  renderNotPublishedChip() {
    const { item, intl } = this.props;
    if (!item.has('published') || item.get('published')) {
      return '';
    }
    return (
      <Chip style={styles.chip}>
        <Avatar icon={<Block />} backgroundColor="#900" />
        { intl.formatMessage(translations.notPublished) }
      </Chip>
    );
  }

  renderTypeTagChip() {
    const { item } = this.props;
    return (
      <Chip style={styles.chip}>
        <Avatar icon={<InfoOutline />} />
        { item.get('lesson_plan_item_type').join(': ') }
      </Chip>
    );
  }

  /*
   * Renders a chip with the date/time range of the item in one of the following formats:
   * - August 18, 2017, 12:00 PM
   * - November 24, 2016, 5:00 PM - 7:00 PM
   * - November 10, 2016, 10:00 AM - November 11, 2016, 11:00 AM
   * Output varies depending on locale.
   */
  renderDateTimeRangeChip() {
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

    return (
      <Chip style={styles.chip}>
        <Avatar icon={<DateRange />} />
        {outputString}
      </Chip>
    );
  }

  renderLocationChip() {
    const { item } = this.props;
    if (!item.has('location') || !item.get('location')) {
      return '';
    }
    const location = item.get('location');
    return (
      <Chip style={styles.chip}>
        <Avatar icon={<Room />} />
        {location}
      </Chip>
    );
  }

  renderChips() {
    return (
      <div style={styles.chipsWrapper}>
        { this.renderNotPublishedChip() }
        { this.renderTypeTagChip() }
        { this.renderDateTimeRangeChip() }
        { this.renderLocationChip() }
      </div>
    );
  }

  renderDescription() {
    const { item } = this.props;

    if (!item.has('description') || !item.get('description')) {
      return '';
    }
    return (
      <CardText dangerouslySetInnerHTML={{ __html: item.get('description') }} />
    );
  }

  renderActions() {
    const { item, intl } = this.props;
    if (!item.has('edit_path') && !item.has('delete_path')) {
      return '';
    }

    return (
      <CardActions>
        {
          item.has('edit_path') ?
            <FlatButton
              label={intl.formatMessage(translations.editItem)}
              href={item.get('edit_path')}
            /> : []
        }
        {
          item.has('delete_path') ?
            <FlatButton
              label={intl.formatMessage(translations.deleteItem)}
              href={item.get('delete_path')}
              data-method="delete"
              data-confirm={intl.formatMessage(translations.deleteItemConfirmation)}
            /> : []
        }
      </CardActions>
    );
  }

  render() {
    return (
      <Card style={styles.card}>
        <CardTitle
          title={this.renderTitle()}
          subtitle={this.renderChips()}
        />
        { this.renderDescription() }
        { this.renderMaterials() }
        { this.renderActions() }
      </Card>
    );
  }
}

LessonPlanItem.propTypes = propTypes;

export default injectIntl(LessonPlanItem);
