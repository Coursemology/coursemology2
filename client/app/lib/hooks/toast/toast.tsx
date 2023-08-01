import { ReactNode } from 'react';
import {
  Id,
  toast as toastify,
  ToastOptions,
  TypeOptions,
  UpdateOptions,
} from 'react-toastify';
import {
  ErrorOutline,
  InfoOutlined,
  SvgIconComponent,
  TaskAlt,
  WarningAmber,
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import { produce } from 'immer';

type Toaster = (message: string, options?: ToastOptions) => Id;

interface PromisedToastMessages {
  pending?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
}

type PromisedToaster = <T = unknown>(
  data: Promise<T>,
  messages: PromisedToastMessages,
  options?: ToastOptions,
) => Promise<T>;

/**
 * `UpdateOptions` also allows for `render` to be a function of type
 * `<P,>(props: ToastContentProps<P>) => ReactNode`. Here, we define
 * a stricter version of `UpdateOptions` to simplify our adapter, and
 * since we only usually pass string `message`s.
 */
interface NodeOnlyUpdateOptions extends UpdateOptions {
  render?: ReactNode;
}

const icons: Partial<Record<TypeOptions, SvgIconComponent>> = {
  error: ErrorOutline,
  info: InfoOutlined,
  success: TaskAlt,
  warning: WarningAmber,
};

const getIconForToastType = (type: TypeOptions): JSX.Element | undefined => {
  const Icon = icons[type];
  if (!Icon) return undefined;

  return <Icon fontSize="large" />;
};

const formattedMessage = (message: ReactNode): JSX.Element => (
  <Typography variant="body2">{message}</Typography>
);

const isUpdateOptions = (
  options?: NodeOnlyUpdateOptions | ToastOptions,
): options is NodeOnlyUpdateOptions =>
  options !== undefined &&
  (options as NodeOnlyUpdateOptions).render !== undefined;

/**
 * Adds our default icons depending on the `type` of the toast. If
 * `options` is an `UpdateOptions`, we also format `render`.
 */
const customize = <O extends NodeOnlyUpdateOptions | ToastOptions>(
  options?: O,
): O | undefined => {
  if (!options) return undefined;

  return produce(options, (draft) => {
    if (isUpdateOptions(draft)) draft.render = formattedMessage(draft.render);

    draft.icon = getIconForToastType(draft.type ?? 'default');
  });
};

const launch: Toaster = (message, options?) =>
  toastify(formattedMessage(message), customize(options));

const toast: Toaster = (message, options?) =>
  launch(message, { ...options, type: 'default' });

const success: Toaster = (message, options?) =>
  launch(message, { ...options, type: 'success' });

const info: Toaster = (message, options?) =>
  launch(message, { ...options, type: 'info' });

const warn: Toaster = (message, options?) =>
  launch(message, { ...options, type: 'warning' });

const error: Toaster = (message, options?) =>
  launch(message, { ...options, type: 'error' });

/**
 * We do not `customize` the options here because we want to retain
 * the default loading spinner.
 */
const loading: Toaster = (message, options?) =>
  toastify.loading(formattedMessage(message), options);

const update = (id: Id, options?: NodeOnlyUpdateOptions): void =>
  toastify.update(id, customize(options));

const promise: PromisedToaster = (data, messages, options?) => {
  return toastify.promise(
    data,
    {
      pending: messages.pending
        ? { render: formattedMessage(messages.pending) }
        : undefined,
      error: messages.error
        ? {
            render: formattedMessage(messages.error),
            type: 'error',
            icon: getIconForToastType('error'),
          }
        : undefined,
      success: messages.success
        ? {
            render: formattedMessage(messages.success),
            type: 'success',
            icon: getIconForToastType('success'),
          }
        : undefined,
    },
    customize(options),
  );
};

export default Object.assign(toast, {
  success,
  info,
  warn,
  error,
  loading,
  update,
  promise,
});
