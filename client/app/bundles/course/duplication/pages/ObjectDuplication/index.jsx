import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import TitleBar from 'lib/components/TitleBar';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { fetchObjectsList } from 'course/duplication/actions';
import TargetCourseSelector from './TargetCourseSelector';
import AssessmentsSelector from './AssessmentsSelector';
import DuplicateButton from './DuplicateButton';

const translations = defineMessages({
  duplicateItems: {
    id: 'course.duplication.ObjectDuplication.duplicateItems',
    defaultMessage: 'Duplicate Items',
  },
});

class ObjectDuplication extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  static renderBody() {
    return (
      <div>
        <TargetCourseSelector />
        <AssessmentsSelector />
        <DuplicateButton />
      </div>
    );
  }

  componentDidMount() {
    this.props.dispatch(fetchObjectsList());
  }

  render() {
    return (
      <div>
        <TitleBar title={<FormattedMessage {...translations.duplicateItems} />} />
        { this.props.isLoading ? <LoadingIndicator /> : ObjectDuplication.renderBody() }
      </div>
    );
  }
}

export default connect(({ objectDuplication }) => ({
  isLoading: objectDuplication.isLoading,
}))(ObjectDuplication);
