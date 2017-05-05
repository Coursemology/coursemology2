import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { CardText, CardTitle } from 'material-ui/Card';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Block from 'material-ui/svg-icons/content/block';
import Room from 'material-ui/svg-icons/action/room';
import DateRange from 'material-ui/svg-icons/action/date-range';
import InfoOutline from 'material-ui/svg-icons/action/info-outline';
import Description from 'material-ui/svg-icons/action/description';
import Divider from 'material-ui/Divider';
import isScreenXs from 'lib/helpers/viewport';
import { red700, grey700 } from 'material-ui/styles/colors';
import { shortDateFormat, standardDateFormat, shortTimeFormat } from 'lib/date-time-defaults';

const propTypes = {
  item: PropTypes.instanceOf(Immutable.Map).isRequired,
  intl: intlShape.isRequired,
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
  title: {
    paddingRight: 50,
  },
  chip: {
    margin: 4,
  },
  chipsWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  section: {
    position: 'relative',
  },
  sectionText: {
    padding: '0px 16px 16px 16px',
    marginBottom: 10,
  },
  attachments: {
    marginTop: 14,
  },
  attachment: {
    position: 'relative',
    paddingTop: 10,
    paddingLeft: 35,
  },
  attachmentIcon: {
    height: 20,
    width: 20,
    display: 'block',
    position: 'absolute',
    top: 0,
    left: 0,
    margin: 10,
  },
  adminMenu: {
    top: 4,
    right: 4,
    position: 'absolute',
  },
};

class LessonPlanItem extends React.Component {
  renderAdminMenu() {
    const { item, intl } = this.props;
    if (!item.has('edit_path') && !item.has('delete_path')) {
      return '';
    }

    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        style={styles.adminMenu}
        className={'admin-button'}
      >
        {
          item.has('edit_path') ?
            <MenuItem
              primaryText={intl.formatMessage(translations.editItem)}
              href={item.get('edit_path')}
            /> : []
        }
        {
          item.has('delete_path') ?
            <MenuItem
              primaryText={intl.formatMessage(translations.deleteItem)}
              href={item.get('delete_path')}
              data-method="delete"
              data-confirm={intl.formatMessage(translations.deleteItemConfirmation)}
            /> : []
        }
      </IconMenu>
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
        <Avatar icon={<Block />} backgroundColor={red700} />
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

  renderMaterials() {
    const { item } = this.props;
    if (!item.has('materials') || !item.get('materials')) {
      return '';
    }
    return (
      <div style={styles.attachments}>
        {
          item.get('materials').map(material =>
            <div key={material.get('name')} style={styles.attachment}>
              <Description style={styles.attachmentIcon} color={grey700} />
              <a href={material.get('url')}>
                { material.get('name') }
              </a>
            </div>
          )
        }
      </div>
    );
  }

  render() {
    const { item } = this.props;

    return (
      <div style={styles.section} id={`item-${item.get('id')}`}>
        <CardTitle
          title={this.renderTitle()}
          style={styles.title}
        />
        <div style={styles.sectionText}>
          { this.renderChips() }
          { this.renderDescription() }
          { this.renderMaterials() }
        </div>
        { this.renderAdminMenu() }
        <Divider />
      </div>
    );
  }
}

LessonPlanItem.propTypes = propTypes;

export default injectIntl(LessonPlanItem);
