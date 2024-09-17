import { Emits } from 'react-emitter-factory';
import { FieldValues, UseFormSetError } from 'react-hook-form';
import { connect, ConnectedProps } from 'react-redux';
import { ConditionsData } from 'types/course/conditions';

import { Material } from '../FileManager';

interface Tab {
  tab_id?: number;
  title?: string;
}

interface FolderAttributes {
  folder_id: number;
  materials?: Material[];

  /**
   * If `true`, Materials component in Course Settings is enabled
   */
  enable_materials_action?: boolean;
}

export interface AssessmentFormEmitter {
  isDirty?: boolean;
}

// @ts-ignore until Assessment store is fully typed
export const connector = connect(({ assessments }) => ({
  tabs: assessments.editPage.tabs,
}));

export interface AssessmentFormProps
  extends ConnectedProps<typeof connector>,
    Emits<AssessmentFormEmitter> {
  tabs: Tab[];
  onSubmit: (data: FieldValues, setError: UseFormSetError<FieldValues>) => void;

  initialValues?;
  isKoditsuExamEnabled: boolean;
  isQuestionsValidForKoditsu: boolean;
  disabled?: boolean;
  showPersonalizedTimelineFeatures?: boolean;
  randomizationAllowed?: boolean;
  folderAttributes?: FolderAttributes;
  conditionAttributes?: ConditionsData;
  pulsegridUrl?: string;
  canManageMonitor?: boolean;
  monitoringEnabled?: boolean;

  /**
   * If `true`, this component is displayed on Edit Assessment page
   */
  editing?: boolean;

  /**
   * If `true`, this course is gamified
   */
  gamified?: boolean;

  /**
   * If `true`, Autograded and Manual grading modes can be changed
   */
  modeSwitching?: boolean;
}
