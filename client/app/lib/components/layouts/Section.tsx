import { ReactNode } from 'react';
import { Grid, Typography, Divider, Container } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

interface SectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const styles: { [key: string]: SxProps<Theme> } = {
  marginBottom: {
    marginBottom: 1,
  },
  stickyHeadersLgOnly: (theme) => ({
    [theme.breakpoints.up('lg')]: {
      position: 'sticky',
      top: '5rem',
      alignSelf: 'flex-start',
    },
  }),
  content: {
    '> *:not(:last-child)': { marginBottom: 2 },
  },
};

const Section = (props: SectionProps): JSX.Element => {
  return (
    <Container disableGutters maxWidth="lg" sx={styles.marginBottom}>
      <Grid container spacing={2} sx={styles.marginBottom}>
        <Grid item xs={12} lg={3} sx={styles.stickyHeadersLgOnly}>
          {props.title ? (
            <Typography variant="h6" color="text.primary">
              {props.title}
            </Typography>
          ) : null}

          {props.subtitle ? (
            <Typography variant="subtitle1" color="text.secondary">
              {props.subtitle}
            </Typography>
          ) : null}
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
