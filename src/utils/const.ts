export const PAGE_TYPES = {
  NEW: 'new',
  EDIT: 'edit',
} as const;

export type PageType = (typeof PAGE_TYPES)[keyof typeof PAGE_TYPES];