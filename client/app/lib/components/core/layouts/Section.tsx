import { ReactNode } from 'react';
import {
  Breakpoint,
  Container,
  Divider,
  Grid,
  Typography,
} from '@mui/material';

interface SectionProps {
  title: string | JSX.Element;
  subtitle?: string;
  children?: ReactNode;
  sticksToNavbar?: boolean;
  titleColor?: string;
  contentClassName?: string;
  size?: Breakpoint;
  id?: string;
}

const Section = (props: SectionProps): JSX.Element => (
  <Container
    className="mb-6"
    disableGutters
    id={props.id}
    maxWidth={props.size ?? 'lg'}
  >
    <Grid container spacing={2}>
      <Grid
        className={`lg:self-start ${
          props.sticksToNavbar ? 'lg:sticky lg:top-0' : ''
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
          <Typography color="text.secondary">{props.subtitle}</Typography>
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
