export type FocusStatus = 'in-progress' | 'completed';

export interface FocusAttachment {
  id: string;
  name: string;
  type: 'text' | 'image' | 'document';
  content: string;
  mimeType?: string;
}

export interface FocusRatingSummary {
  average: number;
  count: number;
}

export interface FocusItem {
  id: string;
  title: string;
  board: 'daniel' | 'lauxen';
  category: string;
  subcategories: string[];
  status: FocusStatus;
  allowComments: boolean;
  allowReviews: boolean;
  allowResenha: boolean;
  requestRating: boolean;
  body: string;
  attachments: FocusAttachment[];
  coverImage: string;
  readingTimeMinutes: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  canEdit?: boolean;
  ratingSummary?: FocusRatingSummary;
}

export interface CreateFocusPayload {
  title: string;
  board: 'daniel' | 'lauxen';
  category?: string;
  subcategories?: string[];
  status?: FocusStatus;
  allowComments?: boolean;
  allowReviews?: boolean;
  allowResenha?: boolean;
  requestRating?: boolean;
  body?: string;
  attachments?: FocusAttachment[];
  coverImage?: string;
}
