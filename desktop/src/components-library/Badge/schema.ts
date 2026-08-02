export interface BadgeSchema {
  count: number;
  maxCount?: number;
  variant: 'primary' | 'success' | 'error' | 'warning';
}
