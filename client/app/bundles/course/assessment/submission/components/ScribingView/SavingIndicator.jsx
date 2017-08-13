import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { scribingTranslations as translations } from '../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  clearSavingStatus: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
  isSaved: PropTypes.bool,
  hasError: PropTypes.bool,
};

const style = {
  savingStatus: {
    width: '50px',
  },
  saving_status_label: {
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0px',
    textTransform: 'uppercase',
    fontFamily: 'Roboto, sans-serif',
  },
};

const SavingIndicator = (props) => {
  const { intl, clearSavingStatus, isSaving, isSaved, hasError } = props;

  let status = '';

  if (isSaving) {
    status = intl.formatMessage(translations.saving);
  } else if (isSaved) {
    status = intl.formatMessage(translations.saved);
    setTimeout(clearSavingStatus, 3000);
  } else if (hasError) {
    status = intl.formatMessage(translations.saveError);
  }

  return (
    <div style={style.savingStatus}>
      <label
        htmlFor="saving"
        style={{
          ...style.saving_status_label,
          color: hasError ? '#e74c3c' : '#bdc3c7',
        }}
      >
        {status}
      </label>
    </div>
  );
};

SavingIndicator.propTypes = propTypes;
export default injectIntl(SavingIndicator);
