import { Launch, Tag } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { SebPayload } from 'types/course/assessment/monitoring';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

import ValidChip from './ValidChip';

const SebPayloadDetail = ({
  of: payload,
  valid,
  validates,
}: {
  of: SebPayload | undefined;
  valid?: boolean;
  validates?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col space-y-2">
      {validates && <ValidChip className="w-fit" valid={valid} />}

      {payload ? (
        <div className="flex flex-col gap-2">
          <section className="flex gap-2">
            <Tag color="disabled" fontSize="small" />

            <Typography
              className="whitespace-pre-wrap h-full break-all font-mono"
              variant="body2"
            >
              {payload.config_key_hash}
            </Typography>
          </section>

          <section className="flex gap-2">
            <Launch color="disabled" fontSize="small" />

            <Typography
              className="whitespace-pre-wrap break-all"
              variant="body2"
            >
              {payload.url}
            </Typography>
          </section>
        </div>
      ) : (
        <Typography className="italic" color="text.disabled" variant="body2">
          {t(translations.blankField)}
        </Typography>
      )}
    </section>
  );
};

export default SebPayloadDetail;
