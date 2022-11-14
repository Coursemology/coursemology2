import { ReactNode } from 'react';
import {
  Breakpoint,
  Container,
  Divider,
  Grid,
  Typography,
} from '@mui/material';

interface SectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  sticksToNavbar?: boolean;
  titleColor?: string;
  contentClassName?: string;
  size?: Breakpoint;
}

const Section = (props: SectionProps): JSX.Element => (
  <Container className="mb-6" disableGutters maxWidth={props.size ?? 'lg'}>
    <Grid container spacing={2}>
      <Grid
        className={`lg:sticky lg:self-start ${
          props.sticksToNavbar ? 'lg:top-20' : 'lg:-top-6'
        }`}
        item
        lg={3}
        xs={12}
      >
        {props.title && (
          <Typography color={props.titleColor ?? 'text.primary'} variant="h6">
            {props.title}
          </Typography>
        )}

        {props.subtitle && (
          <Typography color="text.secondary" variant="body1">
            {props.subtitle}
          </Typography>
        )}
      </Grid>

      <Grid
        className={`space-y-5 ${props.contentClassName}`}
        item
        lg={9}
        xs={12}
      >
        {props.children}
      </Grid>
    </Grid>

    <Divider className="mt-8" />
  </Container>
);

export default Section;
