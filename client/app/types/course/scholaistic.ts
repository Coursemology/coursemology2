export interface ScholaisticAssessmentData {
  id: number;
  title: string;
  startAt: string;
  endAt?: string;
  published: boolean;
  isStartTimeBegin: boolean;
  isEndTimePassed?: boolean;
  status: 'attempting' | 'submitted' | 'open' | 'unavailable';
  baseExp?: number;
  submissionsCount?: number;
  studentsCount?: number;
}

export interface ScholaisticAssessmentsIndexData {
  assessments: ScholaisticAssessmentData[];
  display: {
    assessmentsTitle?: string;
    isStudent: boolean;
    isGamified: boolean;
    canEditAssessments: boolean;
    canCreateAssessments: boolean;
    canViewSubmissions: boolean;
  };
}

export interface ScholaisticAssessmentNewData {
  embedSrc: string;
  display: {
    assessmentsTitle?: string;
  };
}

export interface ScholaisticAssessmentEditData {
  embedSrc: string;
  assessment: {
    baseExp: number;
  };
  display: {
    assessmentTitle: string;
    isGamified: boolean;
    assessmentsTitle?: string;
  };
}

export interface ScholaisticAssessmentUpdateData {
  baseExp: number;
}

export interface ScholaisticAssessmentUpdatePostData {
  scholaistic_assessment: {
    base_exp: ScholaisticAssessmentUpdateData['baseExp'];
  };
}

export interface ScholaisticAssessmentViewData {
  embedSrc: string;
  display: {
    assessmentTitle: string;
    assessmentsTitle?: string;
  };
}

export interface ScholaisticAssessmentSubmissionsIndexData {
  embedSrc: string;
  display: {
    assessmentTitle: string;
    assessmentsTitle?: string;
  };
}

export interface ScholaisticAssessmentSubmissionEditData {
  embedSrc: string;
  display: {
    assessmentTitle: string;
    creatorName: string;
    assessmentsTitle?: string;
  };
}

export interface ScholaisticAssistantEditData {
  embedSrc: string;
  display: {
    assistantTitle: string;
  };
}

export interface ScholaisticAssistantsIndexData {
  embedSrc: string;
}
