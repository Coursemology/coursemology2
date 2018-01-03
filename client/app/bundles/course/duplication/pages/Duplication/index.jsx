import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';

import TitleBar from 'lib/components/TitleBar';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import DateTimePicker from 'lib/components/form/DateTimePicker';
import { fetchObjectsList, setDuplicationMode } from 'course/duplication/actions';

import ItemsSelector from './ItemsSelector';
import DuplicateAllButton from './DuplicateAllButton';
import DestinationCourseSelector from './DestinationCourseSelector';
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
    defaultMessage: 'Items',
  },
  title: {
    id: 'course.duplication.Duplication.title',
    defaultMessage: 'Title',
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
});

const styles = {
  bodyGrid: {
    display: 'grid',
    gridTemplateColumns: '210px auto',
    gridTemplateRows: 'auto',
  },
  sidebar: {
    padding: '25px 20px',
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

class Duplication extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    isCourseSelected: PropTypes.bool.isRequired,
    duplicationMode: PropTypes.string.isRequired,
    currentCourse: PropTypes.shape({
      title: PropTypes.string,
      start_at: PropTypes.string,
    }).isRequired,

    dispatch: PropTypes.func.isRequired,
    intl: intlShape,
  }

  componentDidMount() {
    this.props.dispatch(fetchObjectsList());
  }

  renderFromCourseMain() {
    const { intl, currentCourse } = this.props;

    return (
      <div>
        <TextField
          disabled
          fullWidth
          name="title"
          value={currentCourse.title}
          floatingLabelText={intl.formatMessage(translations.title)}
        />
        <DateTimePicker
          disabled
          name="start_at"
          value={currentCourse.start_at}
          floatingLabelText={intl.formatMessage(translations.startAt)}
        />
      </div>
    );
  }

  renderToCourseSidebar() {
    const { dispatch, duplicationMode } = this.props;

    return (
      <div>
        <h3><FormattedMessage {...translations.toCourse} /></h3>
        <RadioButtonGroup
          name="duplicationMode"
          style={styles.radioButtonGroup}
          valueSelected={duplicationMode}
          onChange={(_, mode) => dispatch(setDuplicationMode(mode))}
        >
          <RadioButton
            value="course"
            label={<FormattedMessage {...translations.newCourse} />}
          />
          <RadioButton
            value="object"
            label={<FormattedMessage {...translations.existingCourse} />}
          />
        </RadioButtonGroup>
      </div>
    );
  }

  renderItemsSelectorSidebar() {
    const { duplicationMode, isCourseSelected } = this.props;

    if (duplicationMode === 'course') {
      return <div style={styles.sidebar}><DuplicateAllButton /></div>;
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

  renderBody() {
    const { isLoading, isCourseSelected, duplicationMode } = this.props;
    if (isLoading) { return <LoadingIndicator />; }

    return (
      <div style={styles.bodyGrid}>
        <div style={styles.sidebar}>
          <h3><FormattedMessage {...translations.fromCourse} /></h3>
        </div>
        <Paper style={styles.mainPanel}>
          { this.renderFromCourseMain() }
        </Paper>

        <div style={styles.sidebar}>
          { this.renderToCourseSidebar() }
        </div>
        <Paper style={styles.mainPanel}>
          <DestinationCourseSelector />
        </Paper>

        { this.renderItemsSelectorSidebar() }
        {
          duplicationMode === 'object' && isCourseSelected ?
            <Paper style={styles.mainPanel}>
              <ItemsSelector />
            </Paper> : <div />
        }
      </div>
    );
  }

  render() {
    return (
      <div>
        <TitleBar title={<FormattedMessage {...translations.duplicateData} />} />
        { this.renderBody() }
      </div>
    );
  }
}

export default connect(({ duplication }) => ({
  isLoading: duplication.isLoading,
  isCourseSelected: !!duplication.targetCourseId,
  duplicationMode: duplication.duplicationMode,
  currentCourse: duplication.currentCourse,
}))(injectIntl(Duplication));
