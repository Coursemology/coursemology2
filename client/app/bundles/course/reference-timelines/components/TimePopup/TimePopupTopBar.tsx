import { Close, Delete } from '@mui/icons-material';
import { Chip, IconButton, Tooltip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import { useLastSaved } from '../../contexts';
import translations from '../../translations';

interface TimePopupTopBarProps {
  default?: boolean;
  new?: boolean;
  onClickDelete?: () => void;
  onClickClose?: () => void;
}

const TimePopupTopBar = (props: TimePopupTopBarProps): JSX.Element => {
  const { t } = useTranslation();

  const { status } = useLastSaved();

  return (
    <nav className="flex min-h-[4rem] items-center justify-end px-4 pt-2">
      {props.default && (
        <Chip
          className="text-neutral-600"
          label={t(translations.defaultTimeline)}
          size="small"
          variant="outlined"
        />
      )}

      {!props.default && !props.new && (
        <Tooltip title={t(translations.deleteTime)}>
          <IconButton
            disabled={status === 'loading'}
            onClick={props.onClickDelete}
            size="small"
          >
            <Delete />
          </IconButton>
        </Tooltip>
      )}

      <IconButton
        className="ml-5"
        disabled={status === 'loading'}
        edge="end"
        onClick={props.onClickClose}
        size="small"
      >
        <Close />
      </IconButton>
    </nav>
  );
};

export default TimePopupTopBar;
