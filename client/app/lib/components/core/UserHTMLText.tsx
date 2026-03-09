import { FC } from 'react';
import { Typography, TypographyProps } from '@mui/material';

const USER_HTML_CLASSES =
  '[&_img]:max-w-full [&_table]:border-collapse [&_th]:border [&_th]:border-solid [&_th]:bg-neutral-200 [&_th]:border-neutral-400 [&_th]:p-2 [&_td]:border [&_td]:border-solid [&_td]:border-neutral-400 [&_td]:p-2';

interface Props extends Omit<TypographyProps, 'dangerouslySetInnerHTML'> {
  html?: string | TrustedHTML | null;
}

const UserHTMLText: FC<Props> = ({
  html,
  className,
  variant = 'body2',
  ...props
}) => {
  if (!html) {
    return null;
  }

  return (
    <Typography
      className={
        className ? `${USER_HTML_CLASSES} ${className}` : USER_HTML_CLASSES
      }
      dangerouslySetInnerHTML={{ __html: html }}
      variant={variant}
      {...props}
    />
  );
};

export default UserHTMLText;
