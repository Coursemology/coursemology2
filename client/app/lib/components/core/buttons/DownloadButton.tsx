import { ReactNode } from 'react';
import { Download } from '@mui/icons-material';
import { Paper, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';

interface DownloadButtonProps {
  href: string;
  children: ReactNode;
  disabled?: boolean;
}

const DownloadButton = (props: DownloadButtonProps): JSX.Element => (
  <div
    className={props.disabled ? 'pointer-events-none opacity-60' : undefined}
  >
    <Paper
      className="w-fit active:!bg-neutral-200 hover?:bg-neutral-100"
      variant="outlined"
    >
      <Link
        className="flex w-fit items-center space-x-4 p-4 no-underline"
        href={props.href}
      >
        <Download color="info" />

        <Typography color="links">{props.children}</Typography>
      </Link>
    </Paper>
  </div>
);

export default DownloadButton;
