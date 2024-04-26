import { FC } from 'react';
import { defineMessages } from 'react-intl';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

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

interface Props {
  callback: (value: boolean) => void;
  selectLinkClassName?: string;
}

const BulkSelectors: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { callback, selectLinkClassName } = props;

  return (
    <>
      <Link
        className={selectLinkClassName ?? 'ml-5 leading-6'}
        onClick={() => callback(true)}
      >
        {t(translations.selectAll)}
      </Link>
      <Link className="ml-3 leading-6" onClick={() => callback(false)}>
        {t(translations.deselectAll)}
      </Link>
    </>
  );
};

export default BulkSelectors;
