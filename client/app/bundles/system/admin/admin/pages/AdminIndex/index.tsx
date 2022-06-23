import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.admin.header',
    defaultMessage: 'Admin',
  },
});

const UsersIndex: FC<Props> = (props) => {
  const { intl } = props;

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
    </>
  );
};

export default injectIntl(UsersIndex);
