import { FC, useEffect, useState, useMemo } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { InvitationType } from 'types/course/userInvitations';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import InstanceUsersTabs from '../components/navigation/InstanceUsersTabs';
import UserInvitationsTable from '../components/tables/UserInvitationsTable';
import { fetchInvitations } from '../operations';
import { getAllInvitationMiniEntities } from '../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  header: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.header',
    defaultMessage: 'Invitations',
  },
  title: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.title',
    defaultMessage: 'Users',
  },
  failure: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.fetch.failure',
    defaultMessage: 'Failed to fetch invitations.',
  },
  pending: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.pending',
    defaultMessage: 'Pending Invitations',
  },
  accepted: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.accepted',
    defaultMessage: 'Accepted Invitations',
  },
  failed: {
    id: 'system.admin.instance.instance.InstanceUsersInvitations.failed',
    defaultMessage: 'Failed Invitations',
  },
});

const InstanceUsersInvitations: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<InvitationType>('pending');
  const invitations = useAppSelector(getAllInvitationMiniEntities);

  // Filter invitations based on selected type
  const filteredInvitations = useMemo(() => {
    switch (selectedType) {
      case 'pending':
        return invitations.filter(inv => !inv.confirmed && inv.isRetryable);
      case 'accepted':
        return invitations.filter(inv => inv.confirmed);
      case 'failed':
        return invitations.filter(inv => !inv.confirmed && !inv.isRetryable);
      default:
        return invitations;
    }
  }, [invitations, selectedType]);

  // Count invitations for each type
  const counts = useMemo(() => ({
    pending: invitations.filter(inv => !inv.confirmed && inv.isRetryable).length,
    accepted: invitations.filter(inv => inv.confirmed).length,
    failed: invitations.filter(inv => !inv.confirmed && !inv.isRetryable).length,
  }), [invitations]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchInvitations())
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() => toast.error(intl.formatMessage(translations.failure)));
  }, [dispatch]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      <InstanceUsersTabs currentTab="invitations-tab" />

      <FormControl className="px-6 py-3">
        <RadioGroup
          onChange={(e) => setSelectedType(e.target.value as InvitationType)}
          row
          value={selectedType}
        >
          <FormControlLabel
            control={<Radio />}
            label={`${intl.formatMessage(translations.pending)} (${counts.pending})`}
            value="pending"
          />
          <FormControlLabel
            control={<Radio />}
            label={`${intl.formatMessage(translations.accepted)} (${counts.accepted})`}
            value="accepted"
          />
          <FormControlLabel
            control={<Radio />}
            label={`${intl.formatMessage(translations.failed)} (${counts.failed})`}
            value="failed"
          />
        </RadioGroup>
      </FormControl>

      <UserInvitationsTable
        invitations={filteredInvitations}
        selectedType={selectedType}
      />
    </>
  );
};

export default injectIntl(InstanceUsersInvitations);
