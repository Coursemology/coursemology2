import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import moment, { longDate } from 'lib/moment';

const translations = defineMessages({
  deleteMilestoneConfirmation: {
    id: 'course.lessonPlan.LessonPlanMilestone.deleteConfirmation',
    defaultMessage: 'Delete Lesson Plan Milestone?',
  },
  editMilestone: {
    id: 'course.lessonPlan.LessonPlanMilestone.editMilestone',
    defaultMessage: 'Edit Milestone',
  },
  deleteMilestone: {
    id: 'course.lessonPlan.LessonPlanMilestone.deleteMilestone',
    defaultMessage: 'Delete Milestone',
  },
});

const styles = {
  titleRow: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  descriptionRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  description: {
    marginBottom: 12,
  },
};

class LessonPlanMilestone extends React.PureComponent {
  static propTypes = {
    id: PropTypes.number,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    startAt: PropTypes.string.isRequired,
    editPath: PropTypes.string,
    deletePath: PropTypes.string,

    intl: intlShape.isRequired,
  }

  renderAdminMenu() {
    const { intl, editPath, deletePath } = this.props;
    if (!editPath && !deletePath) { return null; }

    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {
          editPath && <MenuItem
            primaryText={intl.formatMessage(translations.editMilestone)}
            href={editPath}
          />
        }
        {
          deletePath && <MenuItem
            primaryText={intl.formatMessage(translations.deleteMilestone)}
            href={deletePath}
            data-method="delete"
            data-confirm={intl.formatMessage(translations.deleteMilestoneConfirmation)}
          />
        }
      </IconMenu>
    );
  }

  render() {
    const { id, title, description, startAt } = this.props;
    return (
      <div id={`milestone-${id}`}>
        <div style={styles.titleRow}>
          <h3>{ title }</h3>
          <p>{ moment(startAt).format(longDate) }</p>
        </div>
        <div style={styles.descriptionRow}>
          <span
            dangerouslySetInnerHTML={{ __html: description }}
            style={styles.description}
          />
          { this.renderAdminMenu() }
        </div>
      </div>
    );
  }
}

export default injectIntl(LessonPlanMilestone);
