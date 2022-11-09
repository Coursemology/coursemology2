import { ComponentProps, ReactNode } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

interface BasePromptProps {
  open?: boolean;
  title?: string | ReactNode;
  children?: string | ReactNode;
  onClose?: () => void;
  disabled?: boolean;
  contentClassName?: string;
}

type DefaultActionProps<Action extends string> = {
  [key in Action as `${key}Label`]?: string;
} & {
  [key in Action as `onClick${Capitalize<key>}`]?: () => void;
} & {
  [key in Action as `${key}Color`]?: ComponentProps<typeof Button>['color'];
} & {
  [key in Action as `${key}Disabled`]?: boolean;
} & {
  [key in Action]?: never;
};

type OverriddenActionProps<Action extends string> = {
  [key in Action as `${key}Label`]?: never;
} & {
  [key in Action as `onClick${Capitalize<key>}`]?: () => never;
} & {
  [key in Action as `${key}Color`]?: never;
} & {
  [key in Action as `${key}Disabled`]?: never;
} & {
  [key in Action]?: ReactNode;
};

type ActionProps<Action extends string> =
  | DefaultActionProps<Action>
  | OverriddenActionProps<Action>;

type PromptProps = BasePromptProps &
  ActionProps<'primary'> &
  ActionProps<'secondary'> &
  ActionProps<'cancel'>;

const Prompt = (props: PromptProps): JSX.Element => {
  const { t } = useTranslation();

  const handleClose = (): void => {
    if (!props.disabled) props.onClose?.();
  };

  return (
    <Dialog fullWidth={true} onClose={handleClose} open={props.open ?? false}>
      {props.title && <DialogTitle>{props.title}</DialogTitle>}

      {props.children && (
        <DialogContent className={props.contentClassName}>
          {typeof props.children === 'string' ? (
            <DialogContentText>{props.children}</DialogContentText>
          ) : (
            props.children
          )}
        </DialogContent>
      )}

      <DialogActions className="flex-wrap">
        {props.secondaryLabel ? (
          <Button
            className="prompt-secondary-btn"
            color={props.secondaryColor}
            disabled={props.secondaryDisabled ?? props.disabled}
            onClick={props.onClickSecondary}
          >
            {props.secondaryLabel}
          </Button>
        ) : (
          props.secondary
        )}

        {!props.cancel ? (
          <Button
            className="prompt-cancel-btn"
            color={props.cancelColor}
            disabled={props.cancelDisabled ?? props.disabled}
            onClick={props.onClickCancel ?? handleClose}
          >
            {props.cancelLabel ?? t(formTranslations.cancel)}
          </Button>
        ) : (
          props.cancel
        )}

        {props.primaryLabel ? (
          <Button
            className="prompt-primary-btn"
            color={props.primaryColor}
            disabled={props.primaryDisabled ?? props.disabled}
            onClick={props.onClickPrimary}
          >
            {props.primaryLabel}
          </Button>
        ) : (
          props.primary
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Prompt;
