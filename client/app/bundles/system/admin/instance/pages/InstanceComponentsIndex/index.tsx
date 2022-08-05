import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import InstanceComponentsForm from '../../components/forms/InstanceComponentsForm';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.components.header',
    defaultMessage: 'Components',
  },
});

const InstanceAdminIndex: FC<Props> = (props) => {
  const { intl } = props;

  return (
    <>
      <PageHeader title={intl.formatMessage(translations.header)} />
      <InstanceComponentsForm />
    </>
  );
};

export default injectIntl(InstanceAdminIndex);
