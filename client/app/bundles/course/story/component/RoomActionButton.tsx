import { defineMessages } from 'react-intl';
import { Button } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  start: {
    id: 'course.story.edit.start',
    defaultMessage: 'Start',
  },
  continue: {
    id: 'course.story.edit.continue',
    defaultMessage: 'Continue',
  },
  view: {
    id: 'course.story.edit.view',
    defaultMessage: 'View',
  },
});

interface RoomActionButtonProps {
  path: string;
  action: 'start' | 'continue' | 'view';
  className?: string;
}

const RoomActionButton = (props: RoomActionButtonProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Link className={props.className} to={props.path}>
      <Button aria-label={t(translations[props.action])} variant="contained">
        {t(translations[props.action])}
      </Button>
    </Link>
  );
};

export default RoomActionButton;
