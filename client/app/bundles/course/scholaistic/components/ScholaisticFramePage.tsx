import { useEffect, useMemo } from 'react';
import { Alert } from '@mui/material';
import { cn } from 'utilities';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const ScholaisticFramePage = ({
  src,
  framed,
  onMessage,
}: {
  src: string;
  framed?: boolean;
  onMessage?: (data: { type: string; payload: unknown }) => void;
}): JSX.Element => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!onMessage) return () => {};

    const handleMessage = ({
      origin,
      data,
    }: MessageEvent<{ type: string; payload: unknown }>): void => {
      if (!origin.endsWith(new URL(src).host)) return;

      onMessage(data);
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, [src, onMessage]);

  const frameSrc = useMemo(() => {
    const url = new URL(src);
    url.searchParams.set('embedOrigin', window.location.origin);

    return url.toString();
  }, [src]);

  const iframe = (
    <iframe
      className={cn('border-none w-full h-[calc(100vh_-_4rem)] flex', {
        'rounded-xl border border-solid border-neutral-200': framed,
      })}
      src={frameSrc}
      title="embed"
    />
  );

  if (!framed) return iframe;

  const srcOrigin = new URL(src).origin;

  return (
    <div className="flex flex-col gap-5">
      <Alert severity="info">
        {t(
          {
            defaultMessage:
              "This section is an embedded experience from {src}. If you can't see some fields, buttons, or elements, try scrolling around this box.",
          },
          {
            src: (
              <Link external href={srcOrigin} opensInNewTab>
                {srcOrigin}
              </Link>
            ),
          },
        )}
      </Alert>

      {iframe}
    </div>
  );
};

export const useScholaisticFrameEvents = ({
  src,
  on: listeners,
}: {
  src: string;
  on: Record<string, (data) => void>;
}): void => {
  useEffect(() => {
    const handleMessage = ({
      origin,
      data,
    }: MessageEvent<{ type: string; payload: unknown }>): void => {
      if (origin !== new URL(src).origin) return;

      listeners[data.type]?.(data.payload);
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  });
};

export default ScholaisticFramePage;
