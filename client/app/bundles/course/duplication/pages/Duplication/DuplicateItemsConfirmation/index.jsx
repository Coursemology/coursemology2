import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import Subheader from 'material-ui/Subheader';
import { Card, CardText } from 'material-ui/Card';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { hideDuplicateItemsConfirmation, duplicateItems } from 'course/duplication/actions';
import { courseShape } from 'course/duplication/propTypes';
import AssessmentsListing from './AssessmentsListing';
import SurveyListing from './SurveyListing';
import AchievementsListing from './AchievementsListing';
import MaterialsListing from './MaterialsListing';
import VideosListing from './VideosListing';

const translations = defineMessages({
  confirmationQuestion: {
    id: 'course.duplication.DuplicateItemsConfirmation.confirmationQuestion',
    defaultMessage: 'Duplicate items?',
  },
  targetCourse: {
    id: 'course.duplication.DuplicateItemsConfirmation.targetCourse',
    defaultMessage: 'Target Course',
  },
  duplicate: {
    id: 'course.duplication.DuplicateItemsConfirmation.duplicate',
    defaultMessage: 'Duplicate',
  },
  failureMessage: {
    id: 'course.duplication.DuplicateItemsConfirmation.failureMessage',
    defaultMessage: 'Duplication Failed.',
  },
  itemUnpublished: {
    id: 'course.duplication.DuplicateItemsConfirmation.itemUnpublished',
    defaultMessage: 'Items are duplicated as unpublished when duplicating to an existing course.',
  },
});

class DuplicateItemsConfirmation extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    isDuplicating: PropTypes.bool,
    targetCourseId: PropTypes.number,
    targetCourses: PropTypes.arrayOf(courseShape),
    selectedItems: PropTypes.shape({}),

    dispatch: PropTypes.func.isRequired,
  }

  renderTargetCourseCard() {
    const { targetCourses, targetCourseId } = this.props;
    const targetCourse = targetCourses.find(course => course.id === targetCourseId);
    const url = `${window.location.protocol}//${targetCourse.host}${targetCourse.path}`;

    return (
      <React.Fragment>
        <Subheader><FormattedMessage {...translations.targetCourse} /></Subheader>
        <Card>
          <CardText>
            <h4>
              <a href={url} target="_blank">
                {targetCourse.title}
              </a>
            </h4>
          </CardText>
        </Card>
      </React.Fragment>
    );
  }

  renderListing() {
    return (
      <React.Fragment>
        <p><FormattedMessage {...translations.confirmationQuestion} /></p>
        { this.renderTargetCourseCard() }
        <AssessmentsListing />
        <SurveyListing />
        <AchievementsListing />
        <MaterialsListing />
        <VideosListing />

        <ReactTooltip id="itemUnpublished">
          <FormattedMessage {...translations.itemUnpublished} />
        </ReactTooltip>
      </React.Fragment>
    );
  }

  render() {
    const { dispatch, open, targetCourseId, selectedItems, isDuplicating } = this.props;
    if (!open) { return null; }
    const failureMessage = <FormattedMessage {...translations.failureMessage} />;

    return (
      <ConfirmationDialog
        open={open}
        onCancel={() => dispatch(hideDuplicateItemsConfirmation())}
        onConfirm={() => dispatch(duplicateItems(targetCourseId, selectedItems, failureMessage))}
        confirmButtonText={<FormattedMessage {...translations.duplicate} />}
        message={this.renderListing()}
        disableCancelButton={isDuplicating}
        disableConfirmButton={isDuplicating}
      />
    );
  }
}

export default connect(({ duplication }) => ({
  open: duplication.confirmationOpen,
  targetCourses: duplication.targetCourses,
  targetCourseId: duplication.targetCourseId,
  selectedItems: duplication.selectedItems,
  isDuplicating: duplication.isDuplicating,
}))(DuplicateItemsConfirmation);
