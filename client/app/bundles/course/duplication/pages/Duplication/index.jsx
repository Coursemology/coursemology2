import { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  FormControlLabel,
  ListSubheader,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import CourseDropdownMenu from 'course/duplication/components/CourseDropdownMenu';
import { duplicationModes } from 'course/duplication/constants';
import {
  changeSourceCourse,
  fetchObjectsList,
} from 'course/duplication/operations';
import {
  courseListingShape,
  sourceCourseShape,
} from 'course/duplication/propTypes';
import { actions } from 'course/duplication/store';
import DateTimePicker from 'lib/components/core/fields/DateTimePicker';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import DestinationCourseSelector from './DestinationCourseSelector';
import DuplicateAllButton from './DuplicateAllButton';
import ItemsSelector from './ItemsSelector';
import ItemsSelectorMenu from './ItemsSelectorMenu';

const translations = defineMessages({
  duplicateData: {
    id: 'course.duplication.Duplication.duplicateData',
    defaultMessage: 'Duplicate Data',
  },
  fromCourse: {
    id: 'course.duplication.Duplication.fromCourse',
    defaultMessage: 'From',
  },
  toCourse: {
    id: 'course.duplication.Duplication.toCourse',
    defaultMessage: 'To',
  },
  items: {
    id: 'course.duplication.Duplication.items',
    defaultMessage: 'Selected Items',
  },
  startAt: {
    id: 'course.duplication.Duplication.startAt',
    defaultMessage: 'Start Date',
  },
  newCourse: {
    id: 'course.duplication.Duplication.newCourse',
    defaultMessage: 'New Course',
  },
  existingCourse: {
    id: 'course.duplication.Duplication.existingCourse',
    defaultMessage: 'Existing Course',
  },
  duplicationDisabled: {
    id: 'course.duplication.Duplication.duplicationDisabled',
    defaultMessage: 'Duplication is disabled for this course.',
  },
  noComponentsEnabled: {
    id: 'course.duplication.Duplication.noComponentsEnabled',
    defaultMessage:
      'All components with duplicable items are disabled. \
      You may enable them under course settings.',
  },
  selectSourceCourse: {
    id: 'course.duplication.Duplication.selectSourceCourse',
    defaultMessage: 'Select course to duplicate from:',
  },
});

const styles = {
  bodyGrid: {
    display: 'grid',
    gridTemplateColumns: '210px auto',
    gridTemplateRows: 'auto',
  },
  itemsSidebarHeader: {
    padding: '25px 20px 0px 20px',
  },
  mainPanel: {
    marginTop: 15,
    padding: '5px 40px 20px 40px',
  },
  radioButtonGroup: {
    marginTop: 20,
  },
  duplicateAllButton: {
    marginTop: 30,
  },
};

class Duplication extends Component {
  componentDidMount() {
    this.props.dispatch(fetchObjectsList());
  }

  renderBody() {
    const {
      isLoading,
      isCourseSelected,
      duplicationMode,
      modesAllowed,
      enabledComponents,
    } = this.props;
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!modesAllowed || modesAllowed.length < 1) {
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.duplicationDisabled} />
        </ListSubheader>
      );
    }
    if (!enabledComponents || enabledComponents.length < 1) {
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.noComponentsEnabled} />
        </ListSubheader>
      );
    }

    return (
      <div style={styles.bodyGrid}>
        <div>
          <Typography variant="h6">
            <FormattedMessage {...translations.fromCourse} />
          </Typography>
        </div>

        <Paper style={styles.mainPanel}>{this.renderFromCourseMain()}</Paper>

        <div>{this.renderToCourseSidebar()}</div>

        <Paper style={styles.mainPanel}>
          <DestinationCourseSelector />
        </Paper>

        {this.renderItemsSelectorSidebar()}

        {duplicationMode === duplicationModes.OBJECT && isCourseSelected ? (
          <Paper style={styles.mainPanel}>
            <ItemsSelector />
          </Paper>
        ) : (
          <div />
        )}
      </div>
    );
  }

  renderFromCourseMain() {
    const {
      currentHost,
      currentCourseId,
      sourceCourse,
      sourceCourses,
      isChangingCourse,
      intl,
      dispatch,
    } = this.props;

    return (
      <>
        <CourseDropdownMenu
          courses={sourceCourses}
          currentCourseId={currentCourseId}
          currentHost={currentHost}
          disabled={isChangingCourse}
          dropDownMenuProps={{ className: 'source-course-dropdown' }}
          onChange={(event) => dispatch(changeSourceCourse(event.target.value))}
          onHome={() => dispatch(changeSourceCourse(currentCourseId))}
          prompt={intl.formatMessage(translations.selectSourceCourse)}
          selectedCourseId={sourceCourse.id}
        />
        <DateTimePicker
          disabled
          label={intl.formatMessage(translations.startAt)}
          name="start_at"
          value={sourceCourse.start_at}
        />
      </>
    );
  }

  renderItemsSelectorSidebar() {
    const { duplicationMode, isCourseSelected } = this.props;

    if (duplicationMode === duplicationModes.COURSE) {
      return <DuplicateAllButton />;
    }
    if (isCourseSelected) {
      return (
        <div>
          <h3 style={styles.itemsSidebarHeader}>
            <FormattedMessage {...translations.items} />
          </h3>
          <ItemsSelectorMenu />
        </div>
      );
    }
    return <div />;
  }

  renderToCourseModeSelector() {
    const { dispatch, duplicationMode } = this.props;
    return (
      <RadioGroup
        name="duplicationMode"
        onChange={(_, mode) => dispatch(actions.setDuplicationMode(mode))}
        style={styles.radioButtonGroup}
        value={duplicationMode}
      >
        <FormControlLabel
          key={duplicationModes.COURSE}
          control={<Radio className="py-0" />}
          label={<FormattedMessage {...translations.newCourse} />}
          value={duplicationModes.COURSE}
        />
        <FormControlLabel
          key={duplicationModes.OBJECT}
          control={<Radio className="py-0" />}
          label={<FormattedMessage {...translations.existingCourse} />}
          value={duplicationModes.OBJECT}
        />
      </RadioGroup>
    );
  }

  renderToCourseSidebar() {
    const { dispatch, modesAllowed } = this.props;
    const header = (
      <Typography variant="h6">
        <FormattedMessage {...translations.toCourse} />
      </Typography>
    );

    const isSingleValidMode =
      modesAllowed &&
      modesAllowed.length === 1 &&
      duplicationModes[modesAllowed[0]];
    if (isSingleValidMode) {
      dispatch(actions.setDuplicationMode(modesAllowed[0]));
      return header;
    }

    return (
      <>
        {header}
        {this.renderToCourseModeSelector()}
      </>
    );
  }

  render() {
    return (
      <Page title={<FormattedMessage {...translations.duplicateData} />}>
        {this.renderBody()}
      </Page>
    );
  }
}

Duplication.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isCourseSelected: PropTypes.bool.isRequired,
  isChangingCourse: PropTypes.bool.isRequired,
  duplicationMode: PropTypes.string.isRequired,
  modesAllowed: PropTypes.arrayOf(PropTypes.string),
  enabledComponents: PropTypes.arrayOf(PropTypes.string),
  currentHost: PropTypes.string.isRequired,
  currentCourseId: PropTypes.number,
  sourceCourse: sourceCourseShape.isRequired,
  sourceCourses: courseListingShape,

  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

const handle = translations.duplicateData;

export default Object.assign(
  connect(({ duplication }) => ({
    isLoading: duplication.isLoading,
    isChangingCourse: duplication.isChangingCourse,
    isCourseSelected: !!duplication.destinationCourseId,
    duplicationMode: duplication.duplicationMode,
    modesAllowed: duplication.sourceCourse.duplicationModesAllowed,
    enabledComponents: duplication.sourceCourse.enabledComponents,
    currentHost: duplication.currentHost,
    currentCourseId: duplication.currentCourseId,
    sourceCourse: duplication.sourceCourse,
    sourceCourses: duplication.sourceCourses,
  }))(injectIntl(Duplication)),
  { handle },
);
