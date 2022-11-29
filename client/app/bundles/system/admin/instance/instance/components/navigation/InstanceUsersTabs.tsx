import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Link } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';

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
  const { currentTab, intl } = props;
  const [tabValue, setTabValue] = useState(currentTab);

  return (
    <Box className="max-w-full">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          onChange={(_, value): void => {
            setTabValue(value);
          }}
          value={tabValue}
          variant="fullWidth"
        >
          <Tab
            component={Link}
            id="instance-users-tab"
            label={intl.formatMessage(translations.usersTab)}
            to="/admin/instance/users"
            value="instance-users-tab"
          />
          <Tab
            component={Link}
            id="invite-users-tab"
            label={intl.formatMessage(translations.inviteTab)}
            to="/admin/instance/users/invite"
            value="invite-users-tab"
          />
          <Tab
            component={Link}
            id="invitations-tab"
            label={intl.formatMessage(translations.invitationsTab)}
            to="/admin/instance/user_invitations"
            value="invitations-tab"
          />
        </Tabs>
      </Box>
    </Box>
  );
};

export default injectIntl(InstanceUsersTabs);
