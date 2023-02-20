import { Typography } from '@mui/material';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import useTranslation from 'lib/hooks/useTranslation';

import BulkAssignTimelineButton from './BulkAssignTimelineButton';
import translations from './translations';

interface ActiveTableToolbarProps {
  selectedRows: CourseUserMiniEntity[];
  setSubmitting: (status: boolean) => void;
  timelinesMap?: Record<number, string>;
  disabled?: boolean;
}

const ActiveTableToolbar = (props: ActiveTableToolbarProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full items-center justify-between">
      <Typography>
        {t(translations.selectedNStudents, { n: props.selectedRows.length })}
      </Typography>

      {props.timelinesMap && (
        <BulkAssignTimelineButton
          disabled={props.disabled}
          getSelectedIds={(): number[] =>
            props.selectedRows.map((user) => user.id)
          }
          setSubmitting={props.setSubmitting}
          timelinesMap={props.timelinesMap}
        />
      )}
    </div>
  );
};

export default ActiveTableToolbar;
