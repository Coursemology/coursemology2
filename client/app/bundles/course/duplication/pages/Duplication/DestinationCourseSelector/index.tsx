import { FC } from 'react';
import { defineMessages } from 'react-intl';
import moment from 'moment';

import CourseDropdownMenu from 'course/duplication/components/CourseDropdownMenu';
import { duplicationModes } from 'course/duplication/constants';
import { duplicateCourse } from 'course/duplication/operations';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { SHORT_DATE_TIME_FORMAT } from 'lib/moment';

import NewCourseForm from './NewCourseForm';

const translations = defineMessages({
  selectDestinationCoursePrompt: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.selectDestinationCoursePrompt',
    defaultMessage: 'Select destination course:',
  },
  defaultTitle: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.defaultTitle',
    defaultMessage: '{title} (Copied at {timestamp})',
  },
  success: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.success',
    defaultMessage: 'Duplication is successful. Redirecting to the new course.',
  },
  pending: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.pending',
    defaultMessage:
      'Please wait as your request to duplicate the course is being processed.\n\
    You may close the window while duplication is in progress and\n\
    you will also receive an email with a link to the new course when it becomes available.',
  },
  failure: {
    id: 'course.duplication.Duplication.DestinationCourseSelector.failure',
    defaultMessage: 'Duplication failed.',
  },
});

const DestinationCourseSelector: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const duplication = useAppSelector(selectDuplicationStore);
  const {
    destinationCourses,
    currentHost,
    currentCourseId,
    destinationCourseId,
    duplicationMode,
    sourceCourse,
    metadata: { currentInstanceId },
    destinationInstances,
    isDuplicating,
  } = duplication;

  const NewCourseDestinationForm = (): JSX.Element => {
    const tomorrow = moment().add(1, 'day');
    const defaultNewCourseStartAt = moment(sourceCourse.start_at).set({
      year: tomorrow.year(),
      month: tomorrow.month(),
      date: tomorrow.date(),
    });

    const timeNow = moment().format(SHORT_DATE_TIME_FORMAT);
    const newTitleValues = { title: sourceCourse.title, timestamp: timeNow };
    const initialValues = {
      destination_instance_id: currentInstanceId,
      new_title: t(translations.defaultTitle, newTitleValues),
      new_start_at: defaultNewCourseStartAt,
    };

    return (
      <NewCourseForm
        disabled={isDuplicating}
        initialValues={initialValues}
        onSubmit={(values, setError) =>
          dispatch(
            duplicateCourse(
              values,
              destinationInstances[values.destination_instance_id]?.host,
              t(translations.success),
              t(translations.pending),
              t(translations.failure),
              setError,
            ),
          )
        }
      />
    );
  };

  const ExistingCourseDestinationForm = (): JSX.Element => {
    return (
      <CourseDropdownMenu
        courses={destinationCourses}
        currentCourseId={currentCourseId}
        currentHost={currentHost}
        prompt={t(translations.selectDestinationCoursePrompt)}
        selectedCourseId={destinationCourseId}
      />
    );
  };

  return duplicationMode === duplicationModes.COURSE ? (
    <NewCourseDestinationForm />
  ) : (
    <ExistingCourseDestinationForm />
  );
};

export default DestinationCourseSelector;
