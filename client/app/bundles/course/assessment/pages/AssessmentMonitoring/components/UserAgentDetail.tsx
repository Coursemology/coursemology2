import { ComponentProps } from 'react';
import { Apple, Public, WindowSharp } from '@mui/icons-material';
import { SvgIcon, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

import ValidChip from './ValidChip';

const PlatformIcon = ({
  userAgent,
  ...iconProps
}: { userAgent: string } & ComponentProps<typeof SvgIcon>): JSX.Element => {
  if (userAgent.includes('Mac')) return <Apple {...iconProps} />;

  if (userAgent.includes('Windows'))
    return (
      <WindowSharp
        {...iconProps}
        className={`text-[#2A78D4] ${iconProps.className ?? ''}`}
      />
    );

  return <Public color="disabled" {...iconProps} />;
};

const UserAgentDetail = ({
  of: userAgent,
  validates,
  valid,
}: {
  of?: string;
  validates?: boolean;
  valid?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col space-y-2">
      {validates && <ValidChip className="w-fit" valid={valid} />}

      {userAgent ? (
        <section className="flex gap-2">
          <PlatformIcon fontSize="small" userAgent={userAgent} />
          <Typography variant="body2">{userAgent}</Typography>
        </section>
      ) : (
        <Typography className="italic" color="text.disabled" variant="body2">
          {t(translations.blankField)}
        </Typography>
      )}
    </section>
  );
};

export default UserAgentDetail;
