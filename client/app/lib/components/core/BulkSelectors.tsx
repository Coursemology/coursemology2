import { CSSProperties, FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

import Link from 'lib/components/core/Link';

const translations = defineMessages({
  selectAll: {
    id: 'lib.components.core.BulkSelectors.selectAll',
    defaultMessage: 'Select All',
  },
  deselectAll: {
    id: 'lib.components.core.BulkSelectors.deselectAll',
    defaultMessage: 'Deselect All',
  },
});

const defaultStyles = {
  selectLink: {
    marginLeft: 20,
    lineHeight: '24px',
  } as CSSProperties,
  deselectLink: {
    marginLeft: 10,
    lineHeight: '24px',
  } as CSSProperties,
};

interface BulkSelectorsProps {
  callback: (value: boolean) => void;
  styles?: {
    selectLink?: CSSProperties;
    deselectLink?: CSSProperties;
  };
}

const BulkSelectors: FC<BulkSelectorsProps> = ({ callback, styles = {} }) => (
  <>
    <Link
      onClick={() => callback(true)}
      style={{ ...defaultStyles.selectLink, ...styles.selectLink }}
    >
      <FormattedMessage {...translations.selectAll} />
    </Link>
    <Link
      onClick={() => callback(false)}
      style={{ ...defaultStyles.deselectLink, ...styles.deselectLink }}
    >
      <FormattedMessage {...translations.deselectAll} />
    </Link>
  </>
);

export default BulkSelectors;
