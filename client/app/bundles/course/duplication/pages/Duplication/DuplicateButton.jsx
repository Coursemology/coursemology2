import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { showDuplicateItemsConfirmation } from 'course/duplication/actions';
import DuplicateItemsConfirmation from './DuplicateItemsConfirmation';

const translations = defineMessages({
  duplicateItems: {
    id: 'course.duplication.DuplicateButton.duplicateItems',
    defaultMessage: 'Duplicate Items',
  },
  selectCourse: {
    id: 'course.duplication.DuplicateButton.selectCourse',
    defaultMessage: 'Select Destination!',
  },
  selectItem: {
    id: 'course.duplication.DuplicateButton.selectItem',
    defaultMessage: 'Select An Item!',
  },
});

const styles = {
  button: {
    marginTop: 20,
  },
};

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
        variant="contained"
        color="secondary"
        disabled={!isCourseSelected || !isItemSelected || isChangingCourse}
        onClick={() => dispatch(showDuplicateItemsConfirmation())}
        style={styles.button}
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
