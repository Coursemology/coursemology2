import { FC, useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { Button, Checkbox, Grid, Tooltip } from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import Note from 'lib/components/Note';
import {
  AchievementCourseUserEntity,
  AchievementEntity,
} from 'types/course/achievements';
import { TableColumns } from 'types/components/DataTable';
import DataTable from 'lib/components/DataTable';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { formatShortDateTime } from 'lib/moment';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { getCourseId } from 'lib/helpers/url-helpers';
import { AppDispatch } from 'types/store';
import AchievementAwardSummary from './AchievementAwardSummary';
import { awardAchievement } from '../../operations';
import { getAchievementURL } from 'lib/helpers/url-builders';

interface Props {
  achievement: AchievementEntity;
  isLoading: boolean;
  handleClose: (skipDialog: boolean) => void;
  intl?: any;
  setIsDirty?: (value: boolean) => void;
}

const styles = {
  badge: {
    maxHeight: 75,
    maxWidth: 75,
    marginRight: 16,
  },
  checkbox: {
    margin: '0px 12px 0px 0px',
    padding: 0,
  },
  courseUserImage: {
    maxHeight: 75,
    maxWidth: 75,
  },
  description: {
    maxWidth: 1200,
  },
  textField: {
    width: '100%',
    marginBottom: '0.5rem',
  },
};

const translations = defineMessages({
  awardSuccess: {
    id: 'course.achievement.achievementAward.success',
    defaultMessage: 'Achievement was successfully awarded and/or revoked.',
  },
  awardFailure: {
    id: 'course.achievement.achievementAward.fail',
    defaultMessage: 'Failed to award achievement.',
  },
  confirmationQuestion: {
    id: 'course.achievement.achievementAward.confirmationQuestion',
    defaultMessage: 'Are you sure you wish to make the following changes?',
  },
  note: {
    id: 'course.achievement.achievementAward.note',
    defaultMessage:
      'If an Achievement has conditions associated with it, \
      Coursemology will automatically award achievements when the student meets those conditions. ',
  },
  noUser: {
    id: 'course.achievement.achievementAward.noUser',
    defaultMessage: 'There is no available user to be awarded.',
  },
  obtainedAchievement: {
    id: 'course.achievement.achievementAward.obtainedAchievement',
    defaultMessage: 'Obtained Achievement',
  },
  saveChanges: {
    id: 'course.achievement.achievementAward.saveChanges',
    defaultMessage: 'Save Changes',
  },
  resetChanges: {
    id: 'course.achievement.achievementAward.discardChanges',
    defaultMessage: 'Reset Changes',
  },
  cancel: {
    id: 'course.achievement.achievementAward.cancel',
    defaultMessage: 'Cancel',
  },
});

const getObtainedUserIds = (
  courseUsers: AchievementCourseUserEntity[],
): number[] =>
  courseUsers.filter((cu) => cu.obtainedAt !== null).map((cu) => cu.id);

const AchievementAwardManager: FC<Props> = (props) => {
  const { achievement, isLoading, handleClose, intl, setIsDirty } = props;
  const achievementUsers = achievement.achievementUsers;

  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const obtainedUserIds = getObtainedUserIds(achievementUsers);
  const [selectedUserIds, setSelectedUserIds] = useState(
    new Set(obtainedUserIds),
  );

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const isPristine = equal(Array.from(selectedUserIds), obtainedUserIds);

  useEffect(() => {
    if (!isLoading && achievementUsers && setIsDirty) {
      if (!isPristine) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    }
  }, [dispatch, isPristine, isLoading, achievementUsers]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!achievementUsers || achievementUsers.length === 0) {
    return <Note message={<FormattedMessage {...translations.noUser} />} />;
  }

  const onSubmit = (
    achievementId: number,
    courseUserIds: number[],
  ): Promise<void> =>
    dispatch(awardAchievement(achievementId, courseUserIds))
      .then(() => {
        toast.success(intl.formatMessage(translations.awardSuccess));
        setTimeout(() => {
          navigate(getAchievementURL(getCourseId(), achievementId));
        }, 100);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.awardFailure));
        throw error;
      });

  const options = {
    customToolbar: () => (
      <>
        <Button color="secondary" onClick={(): void => handleClose(false)}>
          <FormattedMessage {...translations.cancel} />
        </Button>
        <Button
          disabled={isPristine}
          onClick={(): void => setSelectedUserIds(new Set(obtainedUserIds))}
        >
          <FormattedMessage {...translations.resetChanges} />
        </Button>
        <Button
          disabled={isPristine}
          onClick={(): void => setOpenConfirmation(true)}
        >
          <FormattedMessage {...translations.saveChanges} />
        </Button>
      </>
    ),
    download: false,
    filter: false,
    jumpToPage: true,
    print: false,
    rowsPerPageOptions: [10, 25, 50],
    selectableRows: 'none',
    setRowProps: (
      _row,
      dataIndex: number,
      _rowIndex: number,
    ): Record<string, unknown> => {
      const obtainedAchievement =
        achievementUsers[dataIndex].obtainedAt !== null;
      const awardedAchievement = selectedUserIds.has(
        achievementUsers[dataIndex].id,
      );
      let backgroundColor: any = null;
      if (!obtainedAchievement && awardedAchievement) {
        backgroundColor = green[100];
      } else if (obtainedAchievement && !awardedAchievement) {
        backgroundColor = red[100];
      } else if (obtainedAchievement) {
        backgroundColor = blue[100];
      }
      return { style: { background: backgroundColor } };
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'name',
      label: 'Name',
      options: {
        filter: false,
      },
    },
    {
      name: 'phantom',
      label: 'User Type',
      options: {
        search: false,
        customBodyRenderLite: (dataIndex: number): string => {
          const isPhantom = achievementUsers[dataIndex].phantom;
          if (isPhantom) {
            return 'Phantom Student';
          }
          return 'Normal Student';
        },
      },
    },
    {
      name: 'obtainedAt',
      label: 'Obtained At',
      options: {
        filter: false,
        search: false,
        customBodyRenderLite: (dataIndex: number): string => {
          const achievementObtainedDate =
            achievementUsers[dataIndex].obtainedAt;
          return formatShortDateTime(achievementObtainedDate);
        },
      },
    },
    {
      name: 'id',
      label: 'Obtained Achievement',
      options: {
        filter: false,
        search: false,
        sort: false,
        customBodyRenderLite: (dataIndex: number): JSX.Element => {
          const userId = achievementUsers[dataIndex].id;
          const isChecked = selectedUserIds.has(userId);
          return (
            <Checkbox
              id={`checkbox_${userId}`}
              key={`checkbox_${userId}`}
              checked={isChecked}
              onChange={(_event, checked): void => {
                if (checked) {
                  setSelectedUserIds((prev) => new Set(prev.add(userId)));
                } else {
                  setSelectedUserIds(
                    (prev) => new Set([...prev].filter((x) => x !== userId)),
                  );
                }
              }}
              style={styles.checkbox}
            />
          );
        },
        customHeadLabelRender: (): JSX.Element => (
          <div style={{ display: 'flex', alignItems: 'end' }}>
            <Checkbox
              defaultChecked={false}
              onChange={(_event, checked): void => {
                if (checked) {
                  setSelectedUserIds(
                    new Set(achievementUsers.map((cu) => cu.id)),
                  );
                } else {
                  setSelectedUserIds(new Set());
                }
              }}
              style={styles.checkbox}
            />
            {intl.formatMessage(translations.obtainedAchievement)}
          </div>
        ),
      },
    },
  ];

  return (
    <>
      <Grid container>
        <Grid
          item
          xs={12}
          display="flex"
          alignItems="center"
          justifyContent="center"
          style={{ marginBottom: 8 }}
        >
          <Tooltip
            title={
              achievement.achievementStatus ? achievement.achievementStatus : ''
            }
          >
            <img
              src={achievement.badge.url}
              alt={achievement.badge.name}
              style={styles.badge}
            />
          </Tooltip>
          <div style={styles.description}>
            <p
              style={{ whiteSpace: 'normal' }}
              dangerouslySetInnerHTML={{ __html: achievement.description }}
            />
          </div>
        </Grid>
        <Grid item xs={12}>
          <DataTable
            data={achievementUsers}
            columns={columns}
            options={options}
            includeRowNumber
          />
        </Grid>
      </Grid>
      {openConfirmation && (
        <ConfirmationDialog
          open={openConfirmation}
          onCancel={(): void => setOpenConfirmation(false)}
          onConfirm={(): void => {
            setIsSubmitting(true);
            onSubmit(achievement.id, Array.from(selectedUserIds))
              .then(() => handleClose(true))
              .catch(() => {
                setIsSubmitting(false);
                setOpenConfirmation(false);
              });
          }}
          confirmButtonText={<FormattedMessage {...translations.saveChanges} />}
          message={
            <>
              <p>
                <FormattedMessage {...translations.confirmationQuestion} />
              </p>
              <AchievementAwardSummary
                achievementUsers={achievementUsers}
                initialObtainedUserIds={obtainedUserIds}
                selectedUserIds={selectedUserIds}
              />
            </>
          }
          disableCancelButton={isSubmitting}
          disableConfirmButton={isSubmitting}
        />
      )}
    </>
  );
};

export default injectIntl(AchievementAwardManager);
