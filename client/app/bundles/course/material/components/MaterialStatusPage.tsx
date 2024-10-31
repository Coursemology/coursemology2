import { ReactNode } from 'react';
import { Typography } from '@mui/material';

import Page from 'lib/components/core/layouts/Page';

interface MaterialStatusPageProps {
  illustration: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}

const MaterialStatusPage = (props: MaterialStatusPageProps): JSX.Element => (
  <Page className="h-full m-auto flex flex-col items-center justify-center text-center">
    {props.illustration}

    <Typography className="mt-5" variant="h6">
      {props.title}
    </Typography>

    <Typography
      className="max-w-3xl mt-2"
      color="text.secondary"
      variant="body2"
    >
      {props.description}
    </Typography>

    {props.children}
  </Page>
);

export default MaterialStatusPage;
