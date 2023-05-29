import { useCallback } from 'react';
import { Breadcrumbs as MuiBreadcrumbs } from '@mui/material';

import LoadingEllipsis from 'lib/components/core/LoadingEllipsis';
import { CrumbData } from 'lib/hooks/router/dynamicNest';
import { CrumbContent } from 'lib/hooks/router/dynamicNest/crumbs';
import useTranslation, { translatable } from 'lib/hooks/useTranslation';

import Crumb from './Crumb';
import { Slider, useSliders } from './sliders';

interface BreadcrumbProps {
  in: CrumbData[];
  className?: string;
  loading?: boolean;
}

const Breadcrumbs = (props: BreadcrumbProps): JSX.Element => {
  const { in: crumbs } = props;

  const { t } = useTranslation();

  const sliders = useSliders();

  const getCrumbElement = useCallback(
    (content: CrumbContent, disabled: boolean, key: string): JSX.Element => (
      <Crumb key={key} to={!disabled && content.url}>
        {translatable(content.title) ? t(content.title) : content.title}
      </Crumb>
    ),
    [],
  );

  const validCrumbs = crumbs.reduce<JSX.Element[]>((elements, crumb, index) => {
    const content = crumb.content;
    if (!content) return elements;

    const isLastCrumb = index >= crumbs.length - 1;

    if (Array.isArray(content)) {
      content.forEach((item, itemIndex) => {
        const isLastItem = isLastCrumb && itemIndex >= content.length - 1;
        const key = `${crumb.pathname}-${itemIndex}`;

        elements.push(getCrumbElement(item, isLastItem, key));
      });
    } else {
      elements.push(getCrumbElement(content, isLastCrumb, crumb.pathname));
    }

    return elements;
  }, []);

  return (
    <div className={`relative flex items-center ${props.className ?? ''}`}>
      <Slider in={sliders.showStart} onClick={sliders.onClickStart} start />
      <Slider in={sliders.showEnd} onClick={sliders.onClickEnd} />

      <nav
        ref={sliders.ref}
        className="scrollbar-hidden overflow-x-scroll pl-5 pr-20"
        onScroll={sliders.handleScroll}
      >
        <MuiBreadcrumbs
          classes={{
            separator: 'mx-2',
            ol: 'flex-nowrap',
            li: 'flex items-center',
          }}
          className="w-fit"
          component="div"
          maxItems={1000}
          separator={<Crumb.Separator />}
        >
          {validCrumbs}

          {props.loading && <LoadingEllipsis />}
        </MuiBreadcrumbs>
      </nav>
    </div>
  );
};

export default Breadcrumbs;
