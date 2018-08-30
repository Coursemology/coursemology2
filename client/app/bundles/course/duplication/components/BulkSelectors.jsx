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

const BulkSelectors = ({ callback, styles: userStyles = {} }) => (
  <>
    <a
      onClick={() => callback(true)}
      style={{ ...styles.selectLink, ...userStyles.selectLink }}
    >
      <FormattedMessage {...translations.selectAll} />
    </a>
    <a
      onClick={() => callback(false)}
      style={{ ...styles.deselectLink, ...userStyles.deselectLink }}
    >
      <FormattedMessage {...translations.deselectAll} />
    </a>
  </>
);

BulkSelectors.propTypes = {
  callback: PropTypes.func,
  styles: PropTypes.object,
};

export default BulkSelectors;
