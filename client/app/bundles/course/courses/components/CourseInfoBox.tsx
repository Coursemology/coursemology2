import { injectIntl } from 'react-intl';
import { FC } from 'react';
import { CardContent, Typography, Grid, Link } from '@mui/material';
import { blue } from '@mui/material/colors';
import { CoursesEntity } from 'types/course/courses';

import './CourseInfoBox.scss';

interface Props {
  course: CoursesEntity;
}

const CourseInfoBox: FC<Props> = (props) => {
  const { course } = props;

  return (
    <Grid item xs={1} sm={1} md={1} lg={1} xl={1} style={{ padding: 10 }}>
      <div
        style={{
          borderStyle: 'solid',
          borderWidth: 0.2,
          borderColor: blue[50],
          borderRadius: 5,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href={course.course}
          style={{
            textDecoration: 'none',
          }}
        >
          <p
            style={{
              textAlign: 'center',
              marginBottom: 0,
            }}
            dangerouslySetInnerHTML={{ __html: course.logo }}
          />
          <CardContent style={{ padding: 5 }}>
            <Typography
              variant="h6"
              component="div"
              align="center"
              color="black"
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
              variant="body2"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </CardContent>
        )}
      </div>
    </Grid>
  );
};

export default injectIntl(CourseInfoBox);
