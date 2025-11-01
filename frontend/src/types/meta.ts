export interface MetaChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface MetaItem {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategories: string[];
  dueDate: string | null;
  isJoint: boolean;
  checklist: MetaChecklistItem[];
  participants: string[];
  createdBy: string;
  status: 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  canEdit?: boolean;
}
