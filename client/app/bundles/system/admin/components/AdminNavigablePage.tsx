import { ReactElement } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tab, Tabs } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';

interface Path {
  icon: ReactElement;
  title: string;
  path: string;
}

interface AdminNavigablePageProps {
  paths: Path[];
}

const AdminNavigablePage = (props: AdminNavigablePageProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Page unpadded>
      <Tabs
        className="sticky top-0 z-50 bg-white border-only-b-neutral-200"
        onChange={(_, value): void => navigate(value)}
        value={location.pathname}
      >
        {props.paths.map((path) => (
          <Tab
            key={path.path}
            className="min-h-0"
            icon={path.icon}
            iconPosition="start"
            label={path.title}
            value={path.path}
          />
        ))}
      </Tabs>

      <div className="relative">
        <Outlet />
      </div>
    </Page>
  );
};

export default AdminNavigablePage;
