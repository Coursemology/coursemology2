export interface MarketplaceListing {
  id: number;
  assessmentId: number;
  title: string;
  questionCount: number;
  adoptions: number;
  firstPublishedAt: string | null;
  previewUrl: string;
  duplicateUrl: string;
}
