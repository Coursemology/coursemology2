import { ReactNode } from 'react';
import { Avatar, Tooltip, Typography } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface StackableBadgeProps {
  title: string;
  src?: string;
  children?: ReactNode;
  className?: string;
}

interface StackedBadgesProps {
  badges?: AssessmentListData['topConditionals'];
  remainingCount?: number;
  assessmentUrl?: string;
}

const StackableBadge = (props: StackableBadgeProps): JSX.Element => (
  <Tooltip disableInteractive title={props.title}>
    <Avatar
      alt={props.title}
      className={`outline outline-2 outline-slot-1 transition-all wh-11 hoverable:group-hover/badges:ml-1 hoverable:group-hover/badges:shadow-lg hoverable:group-hover/badges:!outline-none group-hover?:outline-slot-2 ${
        props.className ?? ''
      }`}
      src={props.src}
    >
      {props.children}
    </Avatar>
  </Tooltip>
);

const StackedBadges = (props: StackedBadgesProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className="group/badges relative min-w-[5rem]">
      <div className="absolute flex h-full items-center -space-x-4 hoverable:group-hover/badges:space-x-0">
        {props.badges?.map((badge) => (
          <Link
            key={badge.url}
            className="transition-margin hoverable:group-hover/badges:-ml-1"
            href={badge.url}
            opensInNewTab
            underlinesOnHover
          >
            <StackableBadge src={badge.badgeUrl} title={badge.title} />
          </Link>
        ))}

        {props.remainingCount && (
          <Link
            className="transition-margin hoverable:group-hover/badges:-ml-1"
            href={props.assessmentUrl}
            opensInNewTab
            underlinesOnHover
          >
            <StackableBadge title={t(translations.seeAllRequirements)}>
              <Typography className="text-white" variant="body2">
                +{props.remainingCount}
              </Typography>
            </StackableBadge>
          </Link>
        )}
      </div>
    </div>
  );
};

export default StackedBadges;
