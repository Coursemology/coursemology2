import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { CardContent, Grid, Link, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { CourseMiniEntity } from 'types/course/courses';

import { getCourseURL } from 'lib/helpers/url-builders';

import styles from './CourseInfoBox.scss';

interface Props extends WrappedComponentProps {
  course: CourseMiniEntity;
}

const CourseInfoBox: FC<Props> = (props) => {
  const { course } = props;

  return (
    <Grid
      item={true}
      lg={1}
      md={1}
      sm={1}
      style={{ padding: 10 }}
      xl={1}
      xs={1}
    >
      <div
        className="course"
        style={{
          borderStyle: 'solid',
          borderWidth: 0.2,
          borderColor: blue[50],
          borderRadius: 10,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href={getCourseURL(course.id)}
          // Change to Router-DOM Link and use this after courses sidebar is migrated
          // to={getCourseURL(course.id)}
          style={{
            textDecoration: 'none',
          }}
        >
          <p
            className={styles.coursePicture}
            dangerouslySetInnerHTML={{ __html: course.logoUrl }}
            style={{
              textAlign: 'center',
              marginBottom: 0,
              marginTop: 10,
            }}
          />
          <CardContent style={{ padding: 5 }}>
            <Typography
              align="center"
              color="black"
              component="div"
              variant="h6"
            >
              {course.title}
            </Typography>
          </CardContent>
        </Link>
        {course.description && (
          <CardContent
            style={{
              padding: '5px 5px 5px 5px',
              height: 100,
              overflow: 'auto',
              margin: 5,
              borderStyle: 'solid',
              borderWidth: 0.2,
              borderColor: blue[50],
              borderRadius: 5,
            }}
          >
            <Typography
              dangerouslySetInnerHTML={{ __html: course.description }}
              variant="body2"
            />
          </CardContent>
        )}
      </div>
    </Grid>
  );
};

export default injectIntl(CourseInfoBox);
