import { FC, useEffect } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import PageHeader from 'lib/components/pages/PageHeader';
import { useSelector, useDispatch } from 'react-redux';
import { AppState, AppDispatch } from 'types/store';
import { getInstance } from '../../selectors';
import { fetchInstance } from '../../operations';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.header',
    defaultMessage: '{instance}',
  },
});

const InstanceAdminIndex: FC<Props> = (props) => {
  const { intl } = props;
  const instance = useSelector((state: AppState) => getInstance(state));
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchInstance());
  }, [dispatch]);

  return (
    <>
      <PageHeader
        title={intl.formatMessage(translations.header, {
          instance: instance.name,
        })}
      />
    </>
  );
};

export default injectIntl(InstanceAdminIndex);
