/* eslint-disable react/no-danger */
import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { FormattedDate, injectIntl, defineMessages } from 'react-intl';
import { ButtonGroup } from 'react-bootstrap';
import DeleteButton from 'lib/components/form/DeleteButton';
import EditButton from 'lib/components/form/EditButton';
import styles from './LessonPlanMilestone.scss';

const translations = defineMessages({
  deleteMilestoneConfirmation: {
    id: 'course.lessonPlan.lessonPlanMilestone.deleteConfirmation',
    defaultMessage: 'Delete Lesson Plan Milestone?',
    description: 'Confirmation message for Lesson Plan Milestone delete button',
  },
});

const propTypes = {
  milestone: PropTypes.instanceOf(Immutable.Map).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class LessonPlanMilestone extends React.Component {

  renderButtons() {
    const { milestone, intl } = this.props;
    return (
      <ButtonGroup>
        { milestone.has('edit_path') ? <EditButton path={milestone.get('edit_path')} /> : [] }
        {
          milestone.has('delete_path') ?
            <DeleteButton
              path={milestone.get('delete_path')}
              confirmationMessage={intl.formatMessage(translations.deleteMilestoneConfirmation)}
            /> : []
        }
      </ButtonGroup>
    );
  }

  render() {
    const { milestone } = this.props;
    return (
      <div
        key={milestone.get('id')}
        id={`lesson-plan-milestone-${milestone.get('id')}`}
        className={styles.lessonPlanBookmark}
      >
        <div className={styles.milestoneTitleRow}>
          <h3>{ milestone.get('title') }</h3>
          <p>
            <FormattedDate
              value={new Date(milestone.get('start_at'))}
              year="numeric"
              month="long"
              day="2-digit"
            />
          </p>
        </div>
        <div className={styles.spaceBetween}>
          <div>
            <p><span dangerouslySetInnerHTML={{ __html: milestone.get('description') }} /></p>
          </div>
          { this.renderButtons() }
        </div>
      </div>
    );
  }
}


LessonPlanMilestone.propTypes = propTypes;

export default injectIntl(LessonPlanMilestone, styles);
