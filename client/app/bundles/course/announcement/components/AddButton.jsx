import React from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import { FormattedMessage } from 'react-intl';
import translations from 'course/announcement/translations';

const style = {
  margin: 12,
};

const propTypes = {
  onTouchTap: PropTypes.func,
};

const AddButton = ({ onTouchTap }) => (
  <RaisedButton
    label={<FormattedMessage {...translations.newButton} />}
    primary
    style={style}
    {...{ onTouchTap }}
  />
);

AddButton.propTypes = propTypes;

export default AddButton;
