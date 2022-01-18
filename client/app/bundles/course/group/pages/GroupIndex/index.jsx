import React from 'react';
import { FormattedMessage } from 'react-intl';

import translations from './translations.intl';
import Note from '../../components/Note';

const NoCategory = () => (
  <Note message={<FormattedMessage {...translations.noCategory} />} />
);

export default NoCategory;
