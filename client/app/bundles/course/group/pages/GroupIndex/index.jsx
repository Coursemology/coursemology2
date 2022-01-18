import React from 'react';
import { FormattedMessage } from 'react-intl';
import Note from '../../components/Note';
import translations from './translations.intl';

const NoCategory = () => (
  <Note message={<FormattedMessage {...translations.noCategory} />} />
);

export default NoCategory;
