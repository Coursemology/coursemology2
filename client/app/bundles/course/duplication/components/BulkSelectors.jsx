import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';

const translations = defineMessages({
  selectAll: {
    id: 'course.duplication.BulkSelectors.selectAll',
    defaultMessage: 'Select All',
  },
  deselectAll: {
    id: 'course.duplication.BulkSelectors.deselectAll',
    defaultMessage: 'Deselect All',
  },
});

const styles = {
  selectLink: {
    marginLeft: 20,
    lineHeight: '24px',
  },
  deselectLink: {
    marginLeft: 10,
    lineHeight: '24px',
  },
};

const BulkSelectors = ({ callback }) => (
  <div>
    <a
      onClick={() => callback(true)}
      style={styles.selectLink}
    >
      <FormattedMessage {...translations.selectAll} />
    </a>
    <a
      onClick={() => callback(false)}
      style={styles.deselectLink}
    >
      <FormattedMessage {...translations.deselectAll} />
    </a>
  </div>
);

BulkSelectors.propTypes = {
  callback: PropTypes.func,
};

export default BulkSelectors;
