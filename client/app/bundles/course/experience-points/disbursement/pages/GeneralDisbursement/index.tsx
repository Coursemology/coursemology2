import { FC } from 'react';
import { useSelector } from 'react-redux';
import { Grid } from '@mui/material';
import { AppState } from 'types/store';

import DisbursementForm from '../../components/forms/DisbursementForm';
import { getAllFilteredUserMiniEntities } from '../../selectors';

const GeneralDisbursement: FC = () => {
  const courseUsers = useSelector((state: AppState) =>
    getAllFilteredUserMiniEntities(state),
  );
  return (
    <Grid item={true} xs={true}>
      <DisbursementForm courseUsers={courseUsers} />
    </Grid>
  );
};

export default GeneralDisbursement;
