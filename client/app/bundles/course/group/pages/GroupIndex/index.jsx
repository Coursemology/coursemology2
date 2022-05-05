import { defineMessages, FormattedMessage } from 'react-intl';

import Note from 'lib/components/Note';

const translations = defineMessages({
  noCategory: {
    id: 'course.group.index.noCategory',
    defaultMessage: "You don't have a group category created! Create one now!",
  },
});

const NoCategory = () => (
  <Note message={<FormattedMessage {...translations.noCategory} />} />
);

export default NoCategory;
