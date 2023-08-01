import { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface ContainerProps {
  children?: ReactNode;
  className?: string;
}

interface WidgetProps extends ContainerProps {
  title: string;
  subtitle?: string;
}

const Widget = (props: WidgetProps): JSX.Element => (
  <form
    className={`w-full rounded-2xl border-neutral-200 sm:max-w-2xl sm:border sm:border-solid sm:p-10 ${
      props.className ?? ''
    }`}
    onSubmit={(e): void => e.preventDefault()}
  >
    <div className="mb-10 space-y-3">
      <Typography variant="h5">{props.title}</Typography>

      {props.subtitle && (
        <Typography color="text.secondary">{props.subtitle}</Typography>
      )}
    </div>

    {props.children}
  </form>
);

const WidgetBody = (props: ContainerProps): JSX.Element => (
  <section className={`space-y-5 ${props.className ?? ''}`}>
    {props.children}
  </section>
);

const WidgetFoot = (props: ContainerProps): JSX.Element => (
  <section
    className={`mt-10 pt-5 border-only-t-neutral-200 ${props.className ?? ''}`}
  >
    {props.children}
  </section>
);

export default Object.assign(Widget, { Body: WidgetBody, Foot: WidgetFoot });
