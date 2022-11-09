import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Card, CardContent, ListSubheader } from '@mui/material';
import PropTypes from 'prop-types';

import {
  duplicateItems,
  hideDuplicateItemsConfirmation,
} from 'course/duplication/actions';
import { courseShape } from 'course/duplication/propTypes';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

import AchievementsListing from './AchievementsListing';
import AssessmentsListing from './AssessmentsListing';
import MaterialsListing from './MaterialsListing';
import SurveyListing from './SurveyListing';
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
  pendingMessage: {
    id: 'course.duplication.DuplicateItemsConfirmation.pendingMessage',
    defaultMessage: 'Duplicating items...',
  },
  successMessage: {
    id: 'course.duplication.DuplicateItemsConfirmation.successMessage',
    defaultMessage: 'Duplication successful.',
  },
  failureMessage: {
    id: 'course.duplication.DuplicateItemsConfirmation.failureMessage',
    defaultMessage: 'Duplication failed.',
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
        <ListSubheader disableSticky={true}>
          <FormattedMessage {...translations.destinationCourse} />
        </ListSubheader>
        <Card>
          <CardContent>
            <h4>
              <a href={url} rel="noopener noreferrer" target="_blank">
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
    const successMessage = (
      <FormattedMessage {...translations.successMessage} />
    );
    const pendingMessage = (
      <FormattedMessage {...translations.pendingMessage} />
    );
    const failureMessage = (
      <FormattedMessage {...translations.failureMessage} />
    );

    return (
      <ConfirmationDialog
        confirmButtonText={<FormattedMessage {...translations.duplicate} />}
        disableCancelButton={isDuplicating}
        disableConfirmButton={isDuplicating}
        message={this.renderListing()}
        onCancel={() => dispatch(hideDuplicateItemsConfirmation())}
        onConfirm={() =>
          dispatch(
            duplicateItems(
              destinationCourseId,
              selectedItems,
              successMessage,
              pendingMessage,
              failureMessage,
            ),
          )
        }
        open={open}
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
