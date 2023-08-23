import { Apple, Cancel, CheckCircle, WindowSharp } from '@mui/icons-material';
import { Chip, Typography } from '@mui/material';

import useTranslation, {
  Descriptor,
  MessageTranslator,
} from 'lib/hooks/useTranslation';
import commonTranslations from 'lib/translations';

import translations from '../../../translations';

interface UserAgentDetailProps {
  of?: string;
  className?: string;
  validate?: boolean;
  valid?: boolean;
}

const platforms = {
  windows: {
    icon: <WindowSharp className="text-[#2A78D4]" />,
    label: commonTranslations.windows,
  },
  macos: {
    icon: <Apple />,
    label: commonTranslations.macos,
  },
} satisfies Record<string, { icon: JSX.Element; label: Descriptor }>;

const getPlatformChipFromUserAgent = (
  userAgent: string,
  t: MessageTranslator,
): JSX.Element | null => {
  let platform: keyof typeof platforms | undefined;

  if (userAgent.includes('Windows')) {
    platform = 'windows';
  } else if (userAgent.includes('Mac')) {
    platform = 'macos';
  }

  if (!platform) return null;

  const { icon, label } = platforms[platform];

  return <Chip icon={icon} label={t(label)} size="small" variant="outlined" />;
};

const UserAgentDetail = (props: UserAgentDetailProps): JSX.Element => {
  const { of: userAgent, className } = props;

  const { t } = useTranslation();

  if (userAgent === undefined)
    return (
      <Typography
        className={`italic ${className ?? ''}`}
        color="text.disabled"
        variant="body2"
      >
        {t(translations.blankField)}
      </Typography>
    );

  const platformChip = getPlatformChipFromUserAgent(userAgent, t);

  return (
    <section className="flex flex-col space-y-2">
      <div className="flex space-x-2 items-center">
        {props.validate && (
          <Chip
            color={props.valid ? 'success' : 'error'}
            icon={props.valid ? <CheckCircle /> : <Cancel />}
            label={
              props.valid
                ? t(translations.validHeartbeat)
                : t(translations.invalidHeartbeat)
            }
            size="small"
            variant="outlined"
          />
        )}

        {platformChip}
      </div>

      <Typography className={className} variant="body2">
        {userAgent}
      </Typography>
    </section>
  );
};

export default UserAgentDetail;
