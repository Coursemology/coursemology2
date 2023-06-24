import { useState } from 'react';
import { InvitationResult } from 'types/system/instance/invitations';

import IndividualInviteForm from '../components/forms/IndividualInviteForm';
import InvitationResultDialog from '../components/misc/InvitationResultDialog';
import InstanceUsersTabs from '../components/navigation/InstanceUsersTabs';

const InstanceUsersInvite = (): JSX.Element => {
  const [showInvitationResultDialog, setShowInvitationResultDialog] =
    useState(false);
  const [invitationResult, setInvitationResult] = useState({});

  const openResultDialog = (result: InvitationResult): void => {
    setInvitationResult(result);
    setShowInvitationResultDialog(true);
  };

  return (
    <>
      <InstanceUsersTabs currentTab="invite-users-tab" />
      <IndividualInviteForm openResultDialog={openResultDialog} />
      {showInvitationResultDialog && (
        <InvitationResultDialog
          handleClose={(): void => setShowInvitationResultDialog(false)}
          invitationResult={invitationResult}
        />
      )}
    </>
  );
};

export default InstanceUsersInvite;
