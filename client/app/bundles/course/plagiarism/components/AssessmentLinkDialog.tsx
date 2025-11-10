import { FC, useEffect, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import CompareArrows from '@mui/icons-material/CompareArrows';
import { TextField, Typography } from '@mui/material';
import { LinkedAssessment } from 'types/course/plagiarism';

import CourseAPI from 'api/course';
import { sortByCourseTitleAndTitle } from 'course/group/utils/sort';
import Prompt from 'lib/components/core/dialogs/Prompt';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import { plagiarismAssessmentsActions } from '../reducers/assessments';

import AssessmentLinkList from './AssessmentLinkList';

interface Props {
  assessmentId: number;
  open: boolean;
  onClose: () => void;
}

const translations = defineMessages({
  linkAssessments: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.AssessmentLinkDialog.linkAssessments',
    defaultMessage: 'Link Assessments',
  },
  linkedAssessments: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.AssessmentLinkDialog.linkedAssessments',
    defaultMessage: 'Linked Assessments',
  },
  unlinkedAssessments: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.AssessmentLinkDialog.unlinkedAssessments',
    defaultMessage: 'Available Assessments',
  },
  searchPlaceholder: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.AssessmentLinkDialog.searchPlaceholder',
    defaultMessage: 'Search by Assessment Title',
  },
  updateLinksSuccess: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.AssessmentLinkDialog.updateLinksSuccess',
    defaultMessage: 'Assessment links updated successfully',
  },
  updateLinksFailure: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.AssessmentLinkDialog.updateLinksFailure',
    defaultMessage: 'Failed to update assessment links',
  },
});

const filterByTitle = (
  search: string,
  assessments: LinkedAssessment[],
): LinkedAssessment[] => {
  if (!search) {
    return assessments;
  }
  const searchLower = search.toLowerCase().trim();
  return assessments.filter((assessment) =>
    assessment.title.toLowerCase().includes(searchLower),
  );
};

const groupAssessmentsByCourse = (
  assessments: LinkedAssessment[],
): Record<number, LinkedAssessment[]> => {
  const grouped: Record<number, LinkedAssessment[]> = {};
  assessments.forEach((assessment) => {
    const courseId = assessment.courseId;
    if (!grouped[courseId]) {
      grouped[courseId] = [];
    }
    grouped[courseId].push(assessment);
  });
  return grouped;
};

const AssessmentLinkDialog: FC<Props> = (props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { open, onClose, assessmentId } = props;

  const [originalLinkedAssessments, setOriginalLinkedAssessments] = useState<
    LinkedAssessment[]
  >([]);
  const [originalUnlinkedAssessments, setOriginalUnlinkedAssessments] =
    useState<LinkedAssessment[]>([]);
  const [linkedAssessments, setLinkedAssessments] = useState<
    LinkedAssessment[]
  >([]);
  const [unlinkedAssessments, setUnlinkedAssessments] = useState<
    LinkedAssessment[]
  >([]);
  const [linkedSearch, setLinkedSearch] = useState('');
  const [unlinkedSearch, setUnlinkedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAssessmentLinks = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response =
        await CourseAPI.plagiarism.fetchLinkedAndUnlinkedAssessments(
          assessmentId,
        );
      const sortedLinked = response.data.linkedAssessments.sort(
        sortByCourseTitleAndTitle,
      );
      const sortedUnlinked = response.data.unlinkedAssessments.sort(
        sortByCourseTitleAndTitle,
      );

      setOriginalLinkedAssessments(sortedLinked);
      setOriginalUnlinkedAssessments(sortedUnlinked);
      setLinkedAssessments(sortedLinked);
      setUnlinkedAssessments(sortedUnlinked);
    } catch (error) {
      toast.error(t(translations.updateLinksFailure));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentLinks();
  }, []);

  const handleMoveToLinked = (assessment: LinkedAssessment): void => {
    setUnlinkedAssessments((prev) =>
      prev
        .filter((a) => a.id !== assessment.id)
        .sort(sortByCourseTitleAndTitle),
    );
    setLinkedAssessments((prev) =>
      [...prev, assessment].sort(sortByCourseTitleAndTitle),
    );
  };

  const handleMoveToUnlinked = (assessment: LinkedAssessment): void => {
    setLinkedAssessments((prev) =>
      prev
        .filter((a) => a.id !== assessment.id)
        .sort(sortByCourseTitleAndTitle),
    );
    setUnlinkedAssessments((prev) =>
      [...prev, assessment].sort(sortByCourseTitleAndTitle),
    );
  };

  const handleUpdateLinks = async (): Promise<void> => {
    if (!assessmentId) return;

    setIsUpdating(true);
    try {
      const linkedIds = linkedAssessments.map((assessment) => assessment.id);
      await CourseAPI.plagiarism.updateAssessmentLinks(assessmentId, linkedIds);
      toast.success(t(translations.updateLinksSuccess));
      dispatch(
        plagiarismAssessmentsActions.updateNumLinkedAssessments({
          assessmentId,
          numLinkedAssessments: linkedIds.length,
        }),
      );
      onClose();
    } catch (error) {
      toast.error(t(translations.updateLinksFailure));
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredLinkedAssessments = filterByTitle(
    linkedSearch,
    linkedAssessments,
  );
  const filteredUnlinkedAssessments = filterByTitle(
    unlinkedSearch,
    unlinkedAssessments,
  );

  const linkedAssessmentsByCourse = groupAssessmentsByCourse(
    filteredLinkedAssessments,
  );
  const unlinkedAssessmentsByCourse = groupAssessmentsByCourse(
    filteredUnlinkedAssessments,
  );

  const originalLinkedMap = useMemo(() => {
    const result = new Map();
    originalLinkedAssessments.forEach((assessment) => {
      result.set(assessment.id, assessment);
    });
    return result;
  }, [originalLinkedAssessments]);

  const originalUnlinkedMap = useMemo(() => {
    const result = new Map();
    originalUnlinkedAssessments.forEach((assessment) => {
      result.set(assessment.id, assessment);
    });
    return result;
  }, [originalUnlinkedAssessments]);

  const colourMap = useMemo(() => {
    const result: Record<number, string> = {};
    unlinkedAssessments.forEach((assessment) => {
      if (originalLinkedMap.has(assessment.id)) {
        result[assessment.id] = 'bg-red-100';
      }
    });
    linkedAssessments.forEach((assessment) => {
      if (originalUnlinkedMap.has(assessment.id)) {
        result[assessment.id] = 'bg-green-100';
      }
    });
    return result;
  }, [
    linkedAssessments,
    unlinkedAssessments,
    originalLinkedMap,
    originalUnlinkedMap,
  ]);

  const hasChanges = useMemo(() => {
    const currentLinkedIds = new Set(linkedAssessments.map((a) => a.id));
    const originalLinkedIds = new Set(
      originalLinkedAssessments.map((a) => a.id),
    );
    return (
      currentLinkedIds.size !== originalLinkedIds.size ||
      [...currentLinkedIds].some((id) => !originalLinkedIds.has(id))
    );
  }, [originalLinkedAssessments, linkedAssessments]);

  return (
    <Prompt
      cancelDisabled={isUpdating}
      maxWidth={false}
      onClickPrimary={handleUpdateLinks}
      onClose={onClose}
      open={open}
      primaryColor="info"
      primaryDisabled={isLoading || isUpdating || !hasChanges}
      primaryLabel={t(formTranslations.saveChanges)}
      title={t(translations.linkAssessments)}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <div className="flex items-stretch gap-4">
          <div className="flex-1 flex flex-col h-[calc(100vh_-_216px)]">
            <Typography variant="h6">
              {t(translations.unlinkedAssessments)}
            </Typography>
            <TextField
              className="w-full mb-2"
              label={t(translations.searchPlaceholder)}
              onChange={(event) => setUnlinkedSearch(event.target.value)}
              value={unlinkedSearch}
              variant="standard"
            />
            <AssessmentLinkList
              assessmentId={assessmentId}
              assessmentsByCourse={unlinkedAssessmentsByCourse}
              colourMap={colourMap}
              onCheck={handleMoveToLinked}
            />
          </div>
          <div className="border border-solid border-neutral-300 flex items-center">
            <CompareArrows />
          </div>
          <div className="flex-1 flex flex-col h-[calc(100vh_-_216px)]">
            <Typography variant="h6">
              {t(translations.linkedAssessments)}
            </Typography>
            <TextField
              className="w-full mb-2"
              label={t(translations.searchPlaceholder)}
              onChange={(event) => setLinkedSearch(event.target.value)}
              value={linkedSearch}
              variant="standard"
            />
            <AssessmentLinkList
              assessmentId={assessmentId}
              assessmentsByCourse={linkedAssessmentsByCourse}
              colourMap={colourMap}
              isChecked
              onCheck={handleMoveToUnlinked}
            />
          </div>
        </div>
      )}
    </Prompt>
  );
};

export default AssessmentLinkDialog;
