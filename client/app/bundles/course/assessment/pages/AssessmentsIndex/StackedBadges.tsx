import { ReactNode } from 'react';
import { Avatar, Tooltip, Typography } from '@mui/material';
import { AssessmentListData } from 'types/course/assessment/assessments';

import Link from 'lib/components/core/Link';

interface StackableBadgeProps {
  src?: string;
  alt?: string;
  children?: ReactNode;
  className?: string;
}

interface StackedBadgesProps {
  badges?: AssessmentListData['topConditionals'];
  remainingCount?: number;
}

const StackableBadge = (props: StackableBadgeProps): JSX.Element => (
  <Avatar
    alt={props.alt}
    className={`outline outline-2 outline-slot-1 transition-all wh-11 hoverable:group-hover/badges:ml-1 hoverable:group-hover/badges:shadow-lg hoverable:group-hover/badges:!outline-none group-hover?:outline-slot-2 ${
      props.className ?? ''
    }`}
    src={props.src}
  >
    {props.children}
  </Avatar>
);

const StackedBadges = (props: StackedBadgesProps): JSX.Element => (
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
          <Tooltip disableInteractive title={badge.title}>
            <StackableBadge alt={badge.title} src={badge.badgeUrl} />
          </Tooltip>
        </Link>
      ))}

      {props.remainingCount && (
        <div className="transition-margin hoverable:group-hover/badges:-ml-1">
          <StackableBadge>
            <Typography className="text-white" variant="body2">
              +{props.remainingCount}
            </Typography>
          </StackableBadge>
        </div>
      )}
    </div>
  </div>
);

export default StackedBadges;
