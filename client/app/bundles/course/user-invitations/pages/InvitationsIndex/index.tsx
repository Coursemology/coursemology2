import { FC, useEffect, useMemo, useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { InvitationType } from 'types/course/userInvitations';

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
  const [selectedType, setSelectedType] = useState<InvitationType>('pending');
  const invitations = useAppSelector(getAllInvitationsMiniEntities);
  const permissions = useAppSelector(getManageCourseUserPermissions);
  const sharedData = useAppSelector(getManageCourseUsersSharedData);

  const { t } = useTranslation();

  // Filter invitations based on selected type
  const filteredInvitations = useMemo(() => {
    switch (selectedType) {
      case 'pending':
        return invitations.filter((inv) => !inv.confirmed && inv.isRetryable);
      case 'accepted':
        return invitations.filter((inv) => inv.confirmed);
      case 'failed':
        return invitations.filter((inv) => !inv.confirmed && !inv.isRetryable);
      default:
        return invitations;
    }
  }, [invitations, selectedType]);

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

          <FormControl className="px-6">
            <RadioGroup
              onChange={(e) =>
                setSelectedType(e.target.value as InvitationType)
              }
              row
              value={selectedType}
            >
              <FormControlLabel
                control={<Radio />}
                label={`${t(translations.pending)} (${counts.pending})`}
                value="pending"
              />
              <FormControlLabel
                control={<Radio />}
                label={`${t(translations.accepted)} (${counts.accepted})`}
                value="accepted"
              />
              <FormControlLabel
                control={<Radio />}
                label={`${t(translations.failed)} (${counts.failed})`}
                value="failed"
              />
            </RadioGroup>
          </FormControl>
          <UserInvitationsTable
            invitations={filteredInvitations}
            selectedType={selectedType}
          />
        </>
      )}
    </Page>
  );
};

export default InvitationsIndex;
