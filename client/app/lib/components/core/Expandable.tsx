import { ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import ResizeObserver from 'utilities/ResizeObserver';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

interface ExpandableProps {
  over: number;
  children: ReactNode;
  initiallyExpanded?: boolean;
}

export const translations = defineMessages({
  showLess: {
    id: 'lib.components.core.Expandable.showLess',
    defaultMessage: 'Show less',
  },
  showMore: {
    id: 'lib.components.core.Expandable.showMore',
    defaultMessage: 'Show more',
  },
});

const Expandable = (props: ExpandableProps): JSX.Element => {
  const { over: minHeightPx } = props;

  const { t } = useTranslation();

  const childRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [clamp, setClamp] = useState(true);
  const [expanded, setExpanded] = useState(props.initiallyExpanded ?? false);

  useLayoutEffect(() => {
    if (!childRef.current || !containerRef.current) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !childRef.current || !containerRef.current) return;

      const { height } = entry.contentRect;
      const isHeightOverflow = height > minHeightPx;

      setClamp(isHeightOverflow);
      if (!isHeightOverflow) setExpanded(false);
    });

    observer.observe(childRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full flex-col items-start">
      <div
        ref={containerRef}
        style={
          clamp && !expanded
            ? { height: minHeightPx, overflow: 'hidden' }
            : undefined
        }
      >
        <div ref={childRef}>{props.children}</div>
      </div>

      {clamp && (
        <Link onClick={(): void => setExpanded((value) => !value)}>
          {expanded ? t(translations.showLess) : t(translations.showMore)}
        </Link>
      )}
    </div>
  );
};

export default Expandable;
