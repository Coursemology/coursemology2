import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { actions } from 'course/duplication/store';

import DuplicateItemsConfirmation from './DuplicateItemsConfirmation';

const translations = defineMessages({
  duplicateItems: {
    id: 'course.duplication.Duplication.DuplicateButton.duplicateItems',
    defaultMessage: 'Duplicate Items',
  },
  selectCourse: {
    id: 'course.duplication.Duplication.DuplicateButton.selectCourse',
    defaultMessage: 'Select Destination!',
  },
  selectItem: {
    id: 'course.duplication.Duplication.DuplicateButton.selectItem',
    defaultMessage: 'Select An Item!',
  },
});

const DuplicateButton = (props) => {
  const { dispatch, isCourseSelected, isItemSelected, isChangingCourse } =
    props;

  let label;
  if (!isCourseSelected) {
    label = 'selectCourse';
  } else if (!isItemSelected) {
    label = 'selectItem';
  } else {
    label = 'duplicateItems';
  }

  return (
    <>
      <Button
        className="mt-4"
        color="secondary"
        disabled={!isCourseSelected || !isItemSelected || isChangingCourse}
        onClick={() => dispatch(actions.showDuplicateItemsConfirmation())}
        variant="contained"
      >
        <FormattedMessage {...translations[label]} />
      </Button>
      <DuplicateItemsConfirmation />
    </>
  );
};

DuplicateButton.propTypes = {
  isChangingCourse: PropTypes.bool,
  isCourseSelected: PropTypes.bool,
  isItemSelected: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
};

export default connect(({ duplication }) => ({
  isChangingCourse: duplication.isChangingCourse,
  isCourseSelected: !!duplication.destinationCourseId,
  isItemSelected: Object.values(duplication.selectedItems).some((hash) =>
    Object.values(hash).some((value) => value),
  ),
}))(DuplicateButton);
