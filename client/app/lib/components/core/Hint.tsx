import { ReactNode, useState } from 'react';
import { Collapse } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import { translations } from './Expandable';

interface HintProps {
  children: ReactNode;
  contentClassName?: string;
  showText?: string;
  hideText?: string;
  initiallyShown?: boolean;
}

const Hint = (props: HintProps): JSX.Element => {
  const { t } = useTranslation();

  const [shown, setShown] = useState(props.initiallyShown);

  const showText = props.showText ?? t(translations.showMore);
  const hideText = props.hideText ?? t(translations.showLess);

  return (
    <article className="flex flex-col items-start">
      <Collapse in={shown}>
        <section className={`pb-4 ${props.contentClassName ?? ''}`}>
          {props.children}
        </section>
      </Collapse>

      <Link onClick={(): void => setShown((value) => !value)}>
        {shown ? hideText : showText}
      </Link>
    </article>
  );
};

export default Hint;
