import { FC, useEffect, useState } from 'react';

import PageHeader from 'lib/components/navigation/PageHeader';

import { fetchInstance } from '../../operations';

const InstanceAdminIndex: FC<unknown> = () => {
  const [instanceName, setInstanceName] = useState('Default');

  useEffect(() => {
    fetchInstance().then((response) => setInstanceName(response.name));
  }, []);

  return <PageHeader title={instanceName} />;
};

export default InstanceAdminIndex;
