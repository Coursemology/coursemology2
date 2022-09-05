import { ReactNode } from 'react';
import { Grid, Typography, Divider, Container } from '@mui/material';

interface SectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  sticksToNavbar?: boolean;
}

const Section = (props: SectionProps): JSX.Element => (
  <Container disableGutters maxWidth="lg" className="mb-6">
    <Grid container spacing={2}>
      <Grid
        item
        xs={12}
        lg={3}
        className={`lg:sticky lg:self-start ${
          props.sticksToNavbar ? 'lg:top-20' : 'lg:-top-6'
        }`}
      >
        {props.title && (
          <Typography variant="h6" color="text.primary">
            {props.title}
          </Typography>
        )}

        {props.subtitle && (
          <Typography variant="subtitle1" color="text.secondary">
            {props.subtitle}
          </Typography>
        )}
      </Grid>

      <Grid item xs={12} lg={9} className="space-y-5">
        {props.children}
      </Grid>
    </Grid>

    <Divider className="mt-8" />
  </Container>
);

export default Section;
