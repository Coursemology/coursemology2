export type OptionalIfNew<T extends 'new' | 'edit'> = T extends 'new'
  ? undefined
  : never;

export interface QuestionData {
  id: number;
  number: number;
  defaultTitle: string;
  title: string | null;
  unautogradable: boolean;
  type: string;
  isCompatibleWithKoditsu?: boolean;

  description?: string;
  editUrl?: string;
  deleteUrl?: string;
  generateFromUrl?: string;
  duplicationUrls?: {
    tab: string;
    destinations: {
      title: string;
      duplicationUrl: string;
      isKoditsu: boolean;
    }[];
  }[];
}

export interface QuestionDuplicationResult {
  destinationUrl: string;
}

export interface AvailableSkills {
  availableSkills: Record<
    number,
    {
      id: number;
      title: string;
      description: string;
    }
  > | null;
  skillsUrl: string;
}

export interface QuestionFormData {
  title: string;
  description: string;
  staffOnlyComments: string;
  maximumGrade: string;
  skillIds: number[];
}
