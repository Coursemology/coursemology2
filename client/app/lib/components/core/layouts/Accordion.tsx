import { ComponentProps, ReactNode, useState } from 'react';
import { ExpandMore } from '@mui/icons-material';
import {
  Accordion as MuiAccordion,
  AccordionDetails as MuiAccordionDetails,
  AccordionSummary as MuiAccordionSummary,
  Typography,
} from '@mui/material';

interface AccordionProps extends ComponentProps<typeof MuiAccordion> {
  title: string;
  children: NonNullable<ReactNode>;
  subtitle?: string;
  disabled?: boolean;
  icon?: ReactNode;
  displayDotIndicator?: boolean;
}

const Accordion = (props: AccordionProps): JSX.Element => {
  const {
    title,
    children,
    subtitle,
    disabled,
    icon,
    displayDotIndicator,
    ...accordionProps
  } = props;
  const [isExpanded, setIsExpanded] = useState(props.defaultExpanded ?? false);

  return (
    <MuiAccordion
      aria-label={title}
      defaultExpanded
      disabled={disabled}
      variant="outlined"
      {...accordionProps}
      className={`overflow-clip rounded-lg ${props.className ?? ''}`}
      onChange={(_, expanded) => setIsExpanded(expanded)}
      slotProps={{
        transition: {
          className: 'overflow-clip',
        },
      }}
    >
      <MuiAccordionSummary
        classes={{
          content: 'flex flex-col !m-0 p-0',
          expandIconWrapper: icon ? 'rotate-0' : undefined,
        }}
        className="space-x-2 px-9 py-6 hover:bg-neutral-100"
        expandIcon={icon || <ExpandMore />}
      >
        <div className="flex items-center">
          <Typography>{title}</Typography>
          {!isExpanded && displayDotIndicator && (
            <Typography className="ml-2 text-gray-400">...</Typography>
          )}
        </div>

        {subtitle && (
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
        )}
      </MuiAccordionSummary>

      <MuiAccordionDetails className="p-0">{children}</MuiAccordionDetails>
    </MuiAccordion>
  );
};

export default Accordion;
