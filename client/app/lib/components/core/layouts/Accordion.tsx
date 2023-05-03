import { ComponentProps, ReactNode } from 'react';
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
}

const Accordion = (props: AccordionProps): JSX.Element => {
  const { title, children, subtitle, disabled, ...accordionProps } = props;

  return (
    <MuiAccordion
      aria-label={title}
      defaultExpanded
      disabled={disabled}
      variant="outlined"
      {...accordionProps}
      className={`overflow-clip rounded-lg ${props.className ?? ''}`}
      TransitionProps={{
        className: 'overflow-clip',
      }}
    >
      <MuiAccordionSummary
        classes={{ content: 'flex flex-col m-0 p-0' }}
        className="space-x-2 px-9 py-6 hover:bg-neutral-100"
        expandIcon={<ExpandMore />}
      >
        <Typography>{title}</Typography>

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
