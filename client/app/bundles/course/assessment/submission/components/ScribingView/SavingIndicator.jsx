import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { scribingTranslations as translations } from '../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  isSaving: PropTypes.bool,
  isSaved: PropTypes.bool,
  hasError: PropTypes.bool,
};

const style = {
  savingStatus: {
    width: '50px',
  },
  savingStatusLabel: {
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0px',
    textTransform: 'uppercase',
    fontFamily: 'Roboto, sans-serif',
  },
};

const SavingIndicator = (props) => {
  const { intl, isSaving, isSaved, hasError } = props;

  function timenow() {
    const now = new Date();
    const h = `0${now.getHours()}`.slice(-2);
    const m = `0${now.getMinutes()}`.slice(-2);
    const s = `0${now.getSeconds()}`.slice(-2);

    return `${h}:${m}:${s}`;
  }

  let status = '';

  if (isSaving) {
    status = intl.formatMessage(translations.saving);
  } else if (isSaved) {
    status = `${intl.formatMessage(translations.saved)} ${timenow()}`;
  } else if (hasError) {
    status = intl.formatMessage(translations.saveError);
  }

  return (
    <div style={style.savingStatus}>
      <label
        htmlFor="saving"
        style={{
          ...style.savingStatusLabel,
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
