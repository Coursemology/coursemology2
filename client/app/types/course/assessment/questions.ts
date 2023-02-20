export interface QuestionData {
  id: number;
  number: number;
  defaultTitle: string;
  title: string | null;
  unautogradable: boolean;
  type: string;

  description?: string;
  editUrl?: string;
  deleteUrl?: string;
  duplicationUrls?: {
    tab: string;
    destinations: {
      title: string;
      duplicationUrl: string;
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
  title: string | null;
  description: string;
  staffOnlyComments: string;
  maximumGrade: string | null;
  skillIds: number[];
}
