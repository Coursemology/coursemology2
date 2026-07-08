import { Typography } from '@mui/material';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

import BulkActionsButton from './BulkActionsButton';

interface ActiveTableToolbarProps {
  selectedRows: CourseUserMiniEntity[];
  timelinesMap?: Record<number, string>;
}

const ActiveTableToolbar = (props: ActiveTableToolbarProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full items-center justify-between">
      <Typography>
        {t(translations.selectedNUsers, { n: props.selectedRows.length })}
      </Typography>

      <BulkActionsButton
        selectedRows={props.selectedRows}
        timelinesMap={props.timelinesMap}
      />
    </div>
  );
};

export default ActiveTableToolbar;
