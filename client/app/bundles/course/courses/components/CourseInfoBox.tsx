import { injectIntl } from 'react-intl';
import { useState, FC } from 'react';
import {
  CardContent,
  Collapse,
  Typography,
  Grid,
  Link,
  CardActions,
  Button,
  IconButton,
  IconButtonProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { grey } from '@mui/material/colors';
import { CoursesEntity } from 'types/course/courses';

const styles = {
  viewCourseButton: {
    marginBottom: 10,
    marginRight: 10,
  },
};

interface Props {
  course: CoursesEntity;
}

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  // Taking out expand to avoid error when passing on to next component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const CourseInfoBox: FC<Props> = (props) => {
  const { course } = props;
  // For description box
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick: () => void = () => {
    setExpanded(!expanded);
  };

  return (
    <Grid
      item
      xs={1}
      sm={1}
      md={1}
      lg={1}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderStyle: 'solid',
        borderWidth: 0.2,
        borderColor: grey[300],
        borderRadius: 5,
        paddingLeft: 0,
        paddingTop: 0,
      }}
    >
      <Link href={course.course} style={{ textDecoration: 'none' }}>
        <Button
          style={
            (styles.viewCourseButton,
            { display: 'flex', flexDirection: 'column', width: '100%' })
          }
          disableTouchRipple
        >
          <p
            style={{ textAlign: 'center' }}
            dangerouslySetInnerHTML={{ __html: course.logo }}
          />
          <CardContent style={{ padding: 0 }}>
            <Typography
              variant="h6"
              component="div"
              align="center"
              color="black"
            >
              {course.title}
            </Typography>
          </CardContent>
        </Button>
      </Link>

      {course.description && (
        <CardActions style={{ paddingTop: 0 }}>
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </ExpandMore>
        </CardActions>
      )}

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography
            variant="body2"
            dangerouslySetInnerHTML={{ __html: course.description }}
          />
        </CardContent>
      </Collapse>
    </Grid>
  );
};

export default injectIntl(CourseInfoBox);
