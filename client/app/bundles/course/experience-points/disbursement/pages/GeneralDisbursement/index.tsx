import { FC } from 'react';
import { Grid } from '@mui/material';

import { useAppSelector } from 'lib/hooks/store';

import DisbursementForm from '../../components/forms/DisbursementForm';
import { getAllFilteredUserMiniEntities } from '../../selectors';

const GeneralDisbursement: FC = () => {
  const courseUsers = useAppSelector(getAllFilteredUserMiniEntities);

  return (
    <Grid item xs>
      <DisbursementForm courseUsers={courseUsers} />
    </Grid>
  );
};

export default GeneralDisbursement;
