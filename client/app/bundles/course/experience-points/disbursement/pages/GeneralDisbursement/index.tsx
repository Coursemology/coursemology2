import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Grid } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import DisbursementForm from '../../components/forms/DisbursementForm';
import { fetchDisbursements } from '../../operations';
import { getAllFilteredUserMiniEntities } from '../../selectors';

const translations = defineMessages({
  fetchDisbursementFailure: {
    id: 'course.experiencePoints.disbursement.GeneralDisbursement.fetchDisbursementFailure',
    defaultMessage: 'Failed to retrieve data.',
  },
});

const GeneralDisbursement: FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const courseUsers = useAppSelector(getAllFilteredUserMiniEntities);

  useEffect(() => {
    dispatch(fetchDisbursements())
      .catch(() => {
        toast.error(t(translations.fetchDisbursementFailure));
      })
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  return (
    <Grid item xs>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <DisbursementForm courseUsers={courseUsers} />
      )}
    </Grid>
  );
};

export default GeneralDisbursement;
