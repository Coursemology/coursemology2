import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import moment, { longDate } from 'lib/moment';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import styles from './LessonPlanMilestone.scss';

const translations = defineMessages({
  deleteMilestoneConfirmation: {
    id: 'course.lessonPlan.lessonPlanMilestone.deleteConfirmation',
    defaultMessage: 'Delete Lesson Plan Milestone?',
    description: 'Confirmation message for Lesson Plan Milestone delete button',
  },
  editMilestone: {
    id: 'course.lessonPlan.lessonPlanMilestone.editMilestone',
    defaultMessage: 'Edit Milestone',
  },
  deleteMilestone: {
    id: 'course.lessonPlan.lessonPlanMilestone.deleteMilestone',
    defaultMessage: 'Delete Milestone',
  },
});

const propTypes = {
  milestone: PropTypes.instanceOf(Immutable.Map).isRequired,
  intl: intlShape.isRequired,
};

class LessonPlanMilestone extends React.Component {
  renderMenu() {
    const { milestone, intl } = this.props;
    if (!milestone.has('edit_path') && !milestone.has('delete_path')) {
      return '';
    }

    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {
          milestone.has('edit_path') ?
            <MenuItem
              primaryText={intl.formatMessage(translations.editMilestone)}
              href={milestone.get('edit_path')}
            /> : []
        }
        {
          milestone.has('delete_path') ?
            <MenuItem
              primaryText={intl.formatMessage(translations.deleteMilestone)}
              href={milestone.get('delete_path')}
              data-method="delete"
              data-confirm={intl.formatMessage(translations.deleteMilestoneConfirmation)}
            /> : []
        }
      </IconMenu>
    );
  }

  render() {
    const { milestone } = this.props;
    return (
      <div key={milestone.get('id')} id={`milestone-${milestone.get('id')}`}>
        <div className={styles.milestoneTitleRow}>
          <h3>{ milestone.get('title') }</h3>
          <p>
            { moment(milestone.get('start_at')).format(longDate) }
          </p>
        </div>
        <div className={styles.spaceBetween}>
          <div>
            <p><span dangerouslySetInnerHTML={{ __html: milestone.get('description') }} /></p>
          </div>
          { this.renderMenu() }
        </div>
      </div>
    );
  }
}


LessonPlanMilestone.propTypes = propTypes;

export default injectIntl(LessonPlanMilestone);
