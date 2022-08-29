import { ReactNode } from 'react';
import { Grid, Typography, Divider, Container } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface SectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  sticksToNavbar?: boolean;
}

const styles: { [key: string]: SxProps<Theme> } = {
  marginBottom: {
    marginBottom: 2,
  },
  content: {
    '> *:not(:last-child)': { marginBottom: 2 },
  },
  container: {
    '& + &': { marginTop: 2 },
  },
};

const Section = (props: SectionProps): JSX.Element => {
  const stickyHeadersLgOnly: SxProps<Theme> = (theme) => ({
    [theme.breakpoints.up('lg')]: {
      position: 'sticky',
      top: props.sticksToNavbar ? '5rem' : '-1em',
      alignSelf: 'flex-start',
    },
  });

  return (
    <Container disableGutters maxWidth="lg" sx={styles.container}>
      <Grid container spacing={2} sx={styles.marginBottom}>
        <Grid item xs={12} lg={3} sx={stickyHeadersLgOnly}>
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

        <Grid item xs={12} lg={9} sx={styles.content}>
          {props.children}
        </Grid>
      </Grid>

      <Divider />
    </Container>
  );
};

export default Section;
