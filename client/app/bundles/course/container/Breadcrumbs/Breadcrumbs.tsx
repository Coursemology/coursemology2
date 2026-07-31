import { useMemo } from 'react';
import { Breadcrumbs as MuiBreadcrumbs } from '@mui/material';

import LoadingEllipsis from 'lib/components/core/LoadingEllipsis';
import { CrumbData, forEachFlatCrumb } from 'lib/hooks/router/dynamicNest';
import useTranslation, { translatable } from 'lib/hooks/useTranslation';

import Crumb from './Crumb';
import { Slider, useSliders } from './sliders';

interface BreadcrumbProps {
  in: CrumbData[];
  className?: string;
  loading?: boolean;
  /** Renders every crumb as inert text instead of a link — e.g. inside the marketplace preview sandbox, where nothing besides the current submission should be reachable. */
  disableLinks?: boolean;
}

const Breadcrumbs = (props: BreadcrumbProps): JSX.Element => {
  const { in: crumbs, disableLinks } = props;

  const { t } = useTranslation();

  const sliders = useSliders();

  const validCrumbs = useMemo(() => {
    const elements: JSX.Element[] = [];

    forEachFlatCrumb(crumbs, (content, isLastCrumb, key) => {
      elements.push(
        <Crumb key={key} to={!isLastCrumb && !disableLinks && content.url}>
          {translatable(content.title) ? t(content.title) : content.title}
        </Crumb>,
      );
    });

    return elements;
  }, [crumbs, disableLinks]);

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
