import { FC, useEffect, useMemo, useState } from 'react';
import { Typography } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import UserManagementTabs from '../../../users/components/navigation/UserManagementTabs';
import InvitationsBarChart from '../../components/misc/InvitationsBarChart';
import UserInvitationsTable from '../../components/tables/UserInvitationsTable';
import { fetchInvitations } from '../../operations';
import {
  getAllInvitationsMiniEntities,
  getManageCourseUserPermissions,
  getManageCourseUsersSharedData,
} from '../../selectors';
import translations from '../../translations';

const InvitationsIndex: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const invitations = useAppSelector(getAllInvitationsMiniEntities);
  const permissions = useAppSelector(getManageCourseUserPermissions);
  const sharedData = useAppSelector(getManageCourseUsersSharedData);

  const { t } = useTranslation();

  // Count invitations for each type
  const counts = useMemo(
    () => ({
      pending: invitations.filter((inv) => !inv.confirmed && inv.isRetryable)
        .length,
      accepted: invitations.filter((inv) => inv.confirmed).length,
      failed: invitations.filter((inv) => !inv.confirmed && !inv.isRetryable)
        .length,
    }),
    [invitations],
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchInvitations())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() => toast.error(t(translations.failure)));
  }, [dispatch]);

  return (
    <Page title={t(translations.manageUsersHeader)} unpadded>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <UserManagementTabs
            permissions={permissions}
            sharedData={sharedData}
          />

          <Page.PaddedSection className="space-y-4 pb-3">
            <Typography variant="h6">
              {t(translations.invitationsHeader)}
            </Typography>
            <InvitationsBarChart
              accepted={counts.accepted}
              failed={counts.failed}
              pending={counts.pending}
            />

            <Typography className="whitespace-pre-line" variant="body2">
              {t(translations.invitationsInfo, { br: <br /> })}
            </Typography>
          </Page.PaddedSection>

          <UserInvitationsTable invitations={invitations} />
        </>
      )}
    </Page>
  );
};

export default InvitationsIndex;
