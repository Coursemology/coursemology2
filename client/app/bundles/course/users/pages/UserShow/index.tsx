import PropTypes from 'prop-types';
import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  // Accordion,
  // AccordionDetails,
  // AccordionSummary,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Icon,
  LinearProgress,
  Paper,
  Table,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import { getUserEntity } from '../../selectors';
// import PageHeader from 'lib/components/pages/PageHeader';
import { loadUser } from '../../operations';
import { getCourseId } from 'lib/helpers/url-helpers';

interface Props {
  intl?: any;
}

const styles = {
  courseUserImage: {
    height: 140,
    width: 140,
  },
  achievementBadge: {
    height: 100,
    width: 100,
  },
  badgeStyle: {
    padding: '12px',
    margin: '4px',
    minWidth: '100px',
    maxWidth: '144px',
  },
  toolbarButton: {
    marginLeft: '12px',
  },
  statsContainer: {
    '& div': {
      margin: '4px',
      padding: '12px',
      minWidth: '100px',
      maxWidth: '144px',
    },
    '& div:first-child': {
      margin: '4px 4px 4px 0px',
    },
  },
  emailStyle: {
    span: {
      display: 'none',
    },
    '&:hover span': {
      display: 'initial',
    },
  },
  icon: {
    fontSize: 12,
    padding: '0px',
  },
};

const translations = defineMessages({
  manageEmailSubscriptions: {
    id: 'course.users.show.manageEmailSubscriptions',
    defaultMessage: 'Manage Email Subscriptions',
  },
  viewExpRecords: {
    id: 'course.users.show.viewExpRecords',
    defaultMessage: 'View EXP Records',
  },
});

const UserShow: FC<Props> = (props) => {
  const { intl } = props;
  //   const courseId = getCourseId();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { userId } = useParams();
  const user = useSelector((state: AppState) => getUserEntity(state, +userId!));
  //   const achievementPermissions = useSelector((state: AppState) =>
  //     getAchievementPermissions(state),
  //   );

  useEffect(() => {
    if (userId) {
      dispatch(loadUser(+userId)).finally(() => setIsLoading(false));
    }
  }, [dispatch, userId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!user) {
    return null;
  }

  const cardToolbar: ReactElement[] = []; // To Add: Reorder Button

  if (user.experiencePointsRecordsUrl) {
    cardToolbar.push(
      <Button
        className="manage-exp-records-button"
        key="manage-exp-records-button"
        variant="outlined"
        color="primary"
        href={user.experiencePointsRecordsUrl}
        style={styles.toolbarButton}
      >
        {intl.formatMessage(translations.viewExpRecords)}
      </Button>,
    );
  }

  if (user.manageEmailSubscriptionUrl) {
    cardToolbar.push(
      <Button
        className="manage-email-subscriptions-button"
        key="manage-email-subscriptions-button"
        variant="outlined"
        color="primary"
        href={user.manageEmailSubscriptionUrl}
        style={styles.toolbarButton}
      >
        {intl.formatMessage(translations.manageEmailSubscriptions)}
      </Button>,
    );
  }

  const renderManageEmail = () => {
    if (user.manageEmailSubscriptionUrl) {
      return (
        <Box sx={styles.emailStyle}>
          <a href={user.manageEmailSubscriptionUrl}>
            {user.email}{' '}
            <Icon
              className="fa fa-wrench manage-email-icon"
              style={styles.icon}
            />
          </a>
        </Box>
      );
    } else {
      return <>{user.email}</>;
    }
  };

  const renderUserStats = () => {
    if (user.role !== 'Student') {
      return null;
    } else {
      return (
        <Grid
          item
          container
          direction="row"
          justifyContent={{ xs: 'center', sm: 'start' }}
          sx={styles.statsContainer}
        >
          <Paper variant="outlined">
            <Typography variant="overline">Level</Typography>
            <Typography variant="h5">{user.level ? user.level : 0}</Typography>
          </Paper>
          <Paper variant="outlined">
            <Typography variant="overline">EXP</Typography>
            <Typography variant="h5">{user.exp ? user.exp : 0}</Typography>
          </Paper>
          <Paper variant="outlined">
            <Typography variant="overline">Achievements</Typography>
            <Typography variant="h5">
              {user.achievementCount ? user.achievementCount : 0}
            </Typography>
          </Paper>
        </Grid>
      );
    }
  };

  const renderUserProfileCard = () => {
    return (
      <Card variant="outlined">
        {cardToolbar.length > 0 ? <CardHeader action={cardToolbar} /> : null}

        <CardContent>
          <Grid
            container
            direction="row"
            flexWrap={{ xs: 'wrap', sm: 'nowrap' }}
            spacing={{ xs: 1, sm: 4 }}
          >
            <Grid
              item
              container
              direction="column"
              alignItems="center"
              xs={12}
              sm={4}
            >
              <Avatar src={user.imageUrl} sx={styles.courseUserImage} />
            </Grid>
            <Grid
              item
              container
              direction="column"
              alignItems={{ xs: 'center', sm: 'start' }}
            >
              <Typography variant="h4">{user.name}</Typography>
              <Typography variant="body1">
                <strong>{user.role}</strong>
              </Typography>
              <Typography variant="body1">{renderManageEmail()}</Typography>

              {renderUserStats()}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderAchievementsSection = () => {
    if (user.role !== 'Student' || !user.achievements) {
      return null;
    } else {
      const someAchievements = user.achievements
        .concat(user.achievements)
        .concat(user.achievements)
        .concat(user.achievements)
        .concat(user.achievements);
      const manyAchievements = someAchievements
        .concat(someAchievements)
        .concat(someAchievements);
      return (
        <>
          {/* <Accordion defaultExpanded> */}
          {/* <AccordionSummary expandIcon={<ExpandMoreIcon />}> */}
          <Typography variant="h4" component="h2" gutterBottom>
            Achievements
          </Typography>
          {/* </AccordionSummary> */}
          {/* <AccordionDetails> */}
          <Grid container>
            {manyAchievements.map((achievement) => (
              <Grid
                item
                id={`achievement_${achievement.id}`}
                key={achievement.id}
                xs={4}
                sm={3}
                md={3}
                lg={2}
              >
                <Link
                  key={achievement.id}
                  to={`/courses/${getCourseId()}/achievements/${
                    achievement.id
                  }`}
                >
                  <Grid
                    container
                    direction="column"
                    spacing={1}
                    alignItems="center"
                  >
                    <Grid container item xs={3} justifyContent="center">
                      <Avatar
                        src={achievement.badge.url}
                        alt={achievement.badge.name}
                        sx={styles.achievementBadge}
                      />
                    </Grid>
                    <Grid item xs>
                      <p> {achievement.title} </p>
                    </Grid>
                  </Grid>
                </Link>
              </Grid>
            ))}
          </Grid>
          {/* </AccordionDetails> */}
          {/* </Accordion> */}
        </>
      );
    }
  };
  function LinearProgressWithLabel(props) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            props.value ?? 0,
          )}%`}</Typography>
        </Box>
      </Box>
    );
  }

  LinearProgressWithLabel.propTypes = {
    /**
     * Value between 0 and 100.
     */
    value: PropTypes.number,
  };

  const renderSkillsSection = () => {
    return (
      user.skillBranches && (
        <>
          <Typography variant="h4" component="h2" gutterBottom>
            Topic Mastery
          </Typography>
          <Table>
            {user.skillBranches.map((skillBranch) => (
              <>
                <TableRow key={`skill-branch-${skillBranch.id}`}>
                  <TableCell>
                    <Typography variant="body1">
                      <strong>{skillBranch.title}</strong>
                    </Typography>
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>

                {skillBranch.skills &&
                  skillBranch.skills.map((skill) => (
                    <TableRow key={`skill-${skill.id}`}>
                      <TableCell style={{ paddingLeft: '2em', width: '25%' }}>
                        <Typography variant="body1">{skill.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <LinearProgressWithLabel value={skill.percentage} />
                      </TableCell>
                      <TableCell style={{ width: '25%' }}>
                        <Typography variant="body1">
                          {skill.grade} / {skill.totalGrade} points
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </>
            ))}
          </Table>
        </>
      )
    );
  };

  return (
    <>
      {/* <PageHeader
        title={intl.formatMessage({
          id: 'course.users.header',
          defaultMessage: 'Profile',
        })}
        toolbars={headerToolbars}
      /> */}
      {renderUserProfileCard()}
      {renderAchievementsSection()}
      {renderSkillsSection()}
    </>
  );
};

export default injectIntl(UserShow);
