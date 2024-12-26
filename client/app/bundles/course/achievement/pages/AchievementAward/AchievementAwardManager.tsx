import { FC, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Button, Checkbox, Grid, Tooltip, Typography } from '@mui/material';
import { blue, green, red } from '@mui/material/colors';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import {
  AchievementCourseUserEntity,
  AchievementEntity,
} from 'types/course/achievements';

import { getAchievementBadgeUrl } from 'course/helper/achievements';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import DataTable from 'lib/components/core/layouts/DataTable';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { getAchievementURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import { formatShortDateTime } from 'lib/moment';

import { awardAchievement } from '../../operations';

import AchievementAwardSummary from './AchievementAwardSummary';

interface Props extends WrappedComponentProps {
  achievement: AchievementEntity;
  isLoading: boolean;
  handleClose: (skipDialog: boolean) => void;
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
    id: 'course.achievement.AchievementAward.AchievementAwardManager.awardSuccess',
    defaultMessage: 'Achievement was successfully awarded and/or revoked.',
  },
  awardFailure: {
    id: 'course.achievement.AchievementAward.AchievementAwardManager.awardFailure',
    defaultMessage: 'Failed to award achievement.',
  },
  confirmationQuestion: {
    id: 'course.achievement.AchievementAward.AchievementAwardManager.confirmationQuestion',
    defaultMessage: 'Are you sure you wish to make the following changes?',
  },
  note: {
    id: 'course.achievement.AchievementAward.AchievementAwardManager.note',
    defaultMessage:
      'If an Achievement has conditions associated with it, \
        Coursemology will automatically award achievements when the student meets those conditions. ',
  },
  noUser: {
    id: 'course.achievement.AchievementAward.AchievementAwardManager.noUser',
    defaultMessage: 'There is no available user to be awarded.',
  },
  obtainedAchievement: {
    id: 'course.achievement.AchievementAward.AchievementAwardManager.obtainedAchievement',
    defaultMessage: 'Obtained Achievement',
  },
  saveChanges: {
    id: 'course.achievement.AchievementAward.AchievementAwardManager.saveChanges',
    defaultMessage: 'Save Changes',
  },
  resetChanges: {
    id: 'course.achievement.AchievementAward.AchievementAwardManager.resetChanges',
    defaultMessage: 'Reset Changes',
  },
  cancel: {
    id: 'course.achievement.AchievementAward.AchievementAwardManager.cancel',
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

  const dispatch = useAppDispatch();
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
      .catch(() => {
        toast.error(intl.formatMessage(translations.awardFailure));
      });

  const options: TableOptions = {
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
    pagination: false,
    print: false,
    selectableRows: 'none',
    setRowProps: (_row, dataIndex, _rowIndex) => {
      const obtainedAchievement =
        achievementUsers[dataIndex].obtainedAt !== null;
      const awardedAchievement = selectedUserIds.has(
        achievementUsers[dataIndex].id,
      );
      let backgroundColor: unknown = null;
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

  const columnHeadLabelAchievement = intl.formatMessage(
    translations.obtainedAchievement,
  );

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
        customBodyRenderLite: (dataIndex): string => {
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
        customBodyRenderLite: (dataIndex): string => {
          const achievementObtainedDate =
            achievementUsers[dataIndex].obtainedAt;
          return formatShortDateTime(achievementObtainedDate);
        },
      },
    },
    {
      name: 'id',
      label: columnHeadLabelAchievement,
      options: {
        filter: false,
        search: false,
        sort: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const userId = achievementUsers[dataIndex].id;
          const isChecked = selectedUserIds.has(userId);
          return (
            <Checkbox
              key={`checkbox_${userId}`}
              checked={isChecked}
              id={`checkbox_${userId}`}
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
            {columnHeadLabelAchievement}
          </div>
        ),
      },
    },
  ];

  return (
    <>
      <Grid container>
        <Grid
          alignItems="center"
          display="flex"
          item
          justifyContent="center"
          style={{ marginBottom: 8 }}
          xs={12}
        >
          <Tooltip
            title={
              achievement.achievementStatus ? achievement.achievementStatus : ''
            }
          >
            <img
              alt={achievement.badge.name}
              src={getAchievementBadgeUrl(
                achievement.badge.url,
                achievement.permissions.canDisplayBadge,
              )}
              style={styles.badge}
            />
          </Tooltip>
          <div style={styles.description}>
            <Typography
              dangerouslySetInnerHTML={{ __html: achievement.description }}
              style={{ whiteSpace: 'normal' }}
              variant="body2"
            />
          </div>
        </Grid>
        <Grid item xs={12}>
          <DataTable
            columns={columns}
            data={achievementUsers}
            includeRowNumber
            options={options}
          />
        </Grid>
      </Grid>
      {openConfirmation && (
        <ConfirmationDialog
          confirmButtonText={<FormattedMessage {...translations.saveChanges} />}
          disableCancelButton={isSubmitting}
          disableConfirmButton={isSubmitting}
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
          open={openConfirmation}
        />
      )}
    </>
  );
};

export default injectIntl(AchievementAwardManager);
