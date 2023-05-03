import { Typography } from '@mui/material';
import { PackageInfoData } from 'types/course/assessment/question/programming';

import DownloadButton from 'lib/components/core/buttons/DownloadButton';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import translations from '../../../../translations';

interface PackageInfoProps {
  of: PackageInfoData;
  disabled?: boolean;
}

const PackageInfo = (props: PackageInfoProps): JSX.Element => {
  const { path, name, updaterName, updatedAt: time } = props.of;

  const { t } = useTranslation();

  return (
    <>
      <DownloadButton disabled={props.disabled} href={path}>
        {name}
      </DownloadButton>

      <Typography color="text.secondary" variant="body2">
        {t(translations.lastUpdated, {
          by: updaterName,
          on: formatLongDateTime(time),
        })}
      </Typography>
    </>
  );
};

export default PackageInfo;
