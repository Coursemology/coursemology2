interface RelatedNode {
  id: string;
  isSatisfied: boolean;
}

interface Node {
  id: string;
  unlocked: boolean;
  satisfiabilityType: string;
  courseMaterialType: string;
  depth: number;
  children: RelatedNode[];
  parents: RelatedNode[];
  unlockRate: number;
  unlockLevel: number;
}

export interface LearningMapState {
  canModify: boolean;
  isLoading: boolean;
  response: {
    didSucceed: boolean;
    message: string;
  };
  nodes: Node[];
  selectedElement: {
    id: string;
    type: string;
  };
}
