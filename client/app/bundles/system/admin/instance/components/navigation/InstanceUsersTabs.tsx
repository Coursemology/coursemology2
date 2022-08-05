import { Tabs, Tab } from '@mui/material';
import { FC, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Link } from 'react-router-dom';

interface Props extends WrappedComponentProps {
  currentTab: string;
}

const translations = defineMessages({
  usersTab: {
    id: 'system.admin.instance.components.navigation.InstanceUsersTabs.usersTab',
    defaultMessage: 'Users',
  },
  inviteTab: {
    id: 'system.admin.instance.components.navigation.InstanceUsersTabs.inviteTab',
    defaultMessage: 'Invite Users',
  },
  invitationsTab: {
    id: 'system.admin.instance.components.navigation.InstanceUsersTabs.invitationsTab',
    defaultMessage: 'Invitations',
  },
});

const InstanceUsersTabs: FC<Props> = (props) => {
  const { currentTab } = props;
  const [tabValue, setTabValue] = useState(currentTab);

  return (
    <Tabs
      onChange={(_, value): void => {
        setTabValue(value);
      }}
      value={tabValue}
      variant="fullWidth"
      sx={{ marginBottom: 2 }}
    >
      <Tab
        id="users-tab"
        label={<FormattedMessage {...translations.usersTab} />}
        value="users-tab"
        to="/admin/instance/users"
        component={Link}
      />
      <Tab
        id="invite-users-tab"
        label={<FormattedMessage {...translations.inviteTab} />}
        value="invite-users-tab"
        to="/admin/instance/users/invite"
        component={Link}
      />
      <Tab
        id="invitations-tab"
        label={<FormattedMessage {...translations.invitationsTab} />}
        value="invitations-tab"
        to="/admin/instance/user_invitations"
        component={Link}
      />
    </Tabs>
  );
};

export default injectIntl(InstanceUsersTabs);
