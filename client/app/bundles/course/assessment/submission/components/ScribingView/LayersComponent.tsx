import { CSSProperties, FC, MouseEventHandler } from 'react';
import Done from '@mui/icons-material/Done';
import {
  Button,
  MenuItem,
  MenuList,
  Popover,
  PopoverOrigin,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import { scribingTranslations as translations } from '../../translations';

import { ScribingLayer } from './ScribingCanvas';

interface LayersPopoverProps {
  layers: ScribingLayer[];
  open: boolean;
  anchorEl: HTMLElement | null;
  onRequestClose: () => void;
  onClickLayer: (layer: ScribingLayer) => void;
}

interface LayersComponentProps extends LayersPopoverProps {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled: boolean;
}

const popoverStyles: {
  anchorOrigin: PopoverOrigin;
  transformOrigin: PopoverOrigin;
  layersLabel: CSSProperties;
} = {
  anchorOrigin: {
    horizontal: 'left',
    vertical: 'bottom',
  },
  transformOrigin: {
    horizontal: 'left',
    vertical: 'top',
  },
  layersLabel: {
    pointerEvents: 'none',
    userSelect: 'none',
    color: 'rgba(0, 0, 0, 0.3)',
    paddingRight: '2px',
    overflowY: 'hidden',
    overflowX: 'hidden',
    lineHeight: '1.5em',
  },
};

const LayersPopover: FC<LayersPopoverProps> = (props) => {
  const { layers, open, anchorEl, onRequestClose, onClickLayer } = props;

  return layers && layers.length !== 0 ? (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={popoverStyles.anchorOrigin}
      onClose={onRequestClose}
      open={open}
      transformOrigin={popoverStyles.transformOrigin}
    >
      <MenuList>
        {layers.map((layer) => (
          <MenuItem
            key={layer.creator_id}
            onClick={() => onClickLayer(layer)}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            {layer.creator_name}
            {layer.isDisplayed && <Done />}
          </MenuItem>
        ))}
      </MenuList>
    </Popover>
  ) : null;
};

const LayersComponent: FC<LayersComponentProps> = (props) => {
  const { layers, onClick, disabled, ...popoverProps } = props;

  const { t } = useTranslation();
  return !disabled ? (
    <div className="flex items-center">
      <label style={popoverStyles.layersLabel}>
        {t(translations.layersLabelText)}
      </label>
      <Button
        className="max-w-48 h-16"
        disabled={disabled}
        onClick={onClick}
        role="button"
        variant="contained"
      >
        <span className="truncate">{layers?.[0]?.creator_name ?? ''}</span>
      </Button>
      <LayersPopover layers={layers} {...popoverProps} />
    </div>
  ) : null;
};

export default LayersComponent;
