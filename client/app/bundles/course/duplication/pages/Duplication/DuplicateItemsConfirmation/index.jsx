import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { Card, CardContent, ListSubheader } from '@material-ui/core';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import {
  hideDuplicateItemsConfirmation,
  duplicateItems,
} from 'course/duplication/actions';
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
  destinationCourse: {
    id: 'course.duplication.DuplicateItemsConfirmation.destinationCourse',
    defaultMessage: 'Destination Course',
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
    defaultMessage:
      'Items are duplicated as unpublished when duplicating to an existing course.',
  },
});

class DuplicateItemsConfirmation extends Component {
  renderListing() {
    return (
      <>
        <p>
          <FormattedMessage {...translations.confirmationQuestion} />
        </p>
        {this.renderdestinationCourseCard()}
        <AssessmentsListing />
        <SurveyListing />
        <AchievementsListing />
        <MaterialsListing />
        <VideosListing />

        <ReactTooltip id="itemUnpublished">
          <FormattedMessage {...translations.itemUnpublished} />
        </ReactTooltip>
      </>
    );
  }

  renderdestinationCourseCard() {
    const { destinationCourses, destinationCourseId } = this.props;
    const destinationCourse = destinationCourses.find(
      (course) => course.id === destinationCourseId,
    );
    const url = `${window.location.protocol}//${destinationCourse.host}${destinationCourse.path}`;

    return (
      <>
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.destinationCourse} />
        </ListSubheader>
        <Card>
          <CardContent>
            <h4>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {destinationCourse.title}
              </a>
            </h4>
          </CardContent>
        </Card>
      </>
    );
  }

  render() {
    const {
      dispatch,
      open,
      destinationCourseId,
      selectedItems,
      isDuplicating,
    } = this.props;
    if (!open) {
      return null;
    }
    const failureMessage = (
      <FormattedMessage {...translations.failureMessage} />
    );

    return (
      <ConfirmationDialog
        open={open}
        onCancel={() => dispatch(hideDuplicateItemsConfirmation())}
        onConfirm={() =>
          dispatch(
            duplicateItems(destinationCourseId, selectedItems, failureMessage),
          )
        }
        confirmButtonText={<FormattedMessage {...translations.duplicate} />}
        message={this.renderListing()}
        disableCancelButton={isDuplicating}
        disableConfirmButton={isDuplicating}
      />
    );
  }
}

DuplicateItemsConfirmation.propTypes = {
  open: PropTypes.bool,
  isDuplicating: PropTypes.bool,
  destinationCourseId: PropTypes.number,
  destinationCourses: PropTypes.arrayOf(courseShape),
  selectedItems: PropTypes.shape({}),

  dispatch: PropTypes.func.isRequired,
};

export default connect(({ duplication }) => ({
  open: duplication.confirmationOpen,
  destinationCourses: duplication.destinationCourses,
  destinationCourseId: duplication.destinationCourseId,
  selectedItems: duplication.selectedItems,
  isDuplicating: duplication.isDuplicating,
}))(DuplicateItemsConfirmation);
