import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Tooltip } from 'react-tooltip';
import { Card, CardContent, ListSubheader, Typography } from '@mui/material';

import { duplicateItems } from 'course/duplication/operations';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { DestinationCourse } from 'course/duplication/types';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import Link from 'lib/components/core/Link';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementsListing from './Achievements';
import AssessmentsListing from './Assessments';
import MaterialsListing from './Materials';
import SurveyListing from './Surveys';
import VideosListing from './Videos';

const translations = defineMessages({
  confirmationQuestion: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.confirmationQuestion',
    defaultMessage: 'Duplicate items?',
  },
  destinationCourse: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.destinationCourse',
    defaultMessage: 'Destination Course',
  },
  duplicate: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.duplicate',
    defaultMessage: 'Duplicate',
  },
  pendingMessage: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.pendingMessage',
    defaultMessage: 'Duplicating items...',
  },
  successMessage: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.successMessage',
    defaultMessage: 'Duplication successful.',
  },
  failureMessage: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.failureMessage',
    defaultMessage: 'Duplication failed.',
  },
  itemUnpublished: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.itemUnpublished',
    defaultMessage:
      'Items are duplicated as unpublished when duplicating to an existing course.',
  },
});

interface DestinationCourseCardProps {
  destinationCourses: DestinationCourse[];
  destinationCourseId: number;
}

const DestinationCourseCard: FC<DestinationCourseCardProps> = (props) => {
  const { t } = useTranslation();
  const { destinationCourses, destinationCourseId } = props;
  const destinationCourse = destinationCourses.find(
    (course) => course.id === destinationCourseId,
  );
  const url = destinationCourse
    ? `${window.location.protocol}//${destinationCourse.host}${destinationCourse.path}`
    : '';

  return (
    <>
      <ListSubheader disableSticky>
        {t(translations.destinationCourse)}
      </ListSubheader>
      <Card>
        <CardContent>
          <Link opensInNewTab to={url} variant="h6">
            {destinationCourse?.title ?? ''}
          </Link>
        </CardContent>
      </Card>
    </>
  );
};

const ListingComponent: FC<DestinationCourseCardProps> = (props) => {
  const { t } = useTranslation();
  const { destinationCourses, destinationCourseId } = props;

  return (
    <>
      <Typography variant="body2">
        {t(translations.confirmationQuestion)}
      </Typography>
      <DestinationCourseCard
        destinationCourseId={destinationCourseId}
        destinationCourses={destinationCourses}
      />
      <AssessmentsListing />
      <SurveyListing />
      <AchievementsListing />
      <MaterialsListing />
      <VideosListing />

      <Tooltip id="itemUnpublished">{t(translations.itemUnpublished)}</Tooltip>
    </>
  );
};

const DuplicateItemsConfirmation: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const duplication = useAppSelector(selectDuplicationStore);

  const {
    confirmationOpen: open,
    destinationCourses,
    destinationCourseId,
    selectedItems,
    isDuplicating,
  } = duplication;

  if (!open) {
    return null;
  }

  return (
    <ConfirmationDialog
      confirmButtonText={t(translations.duplicate)}
      disableCancelButton={isDuplicating}
      disableConfirmButton={isDuplicating}
      message={
        <ListingComponent
          destinationCourseId={destinationCourseId}
          destinationCourses={destinationCourses}
        />
      }
      onCancel={() => dispatch(actions.hideDuplicateItemsConfirmation())}
      onConfirm={() =>
        dispatch(
          duplicateItems(
            destinationCourseId,
            selectedItems,
            t(translations.successMessage),
            t(translations.pendingMessage),
            t(translations.failureMessage),
          ),
        )
      }
      open={open}
    />
  );
};

export default DuplicateItemsConfirmation;
