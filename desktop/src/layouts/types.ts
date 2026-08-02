/**
 * AppForge-AI — Layout Types
 */

export interface LayoutSlot {
  id: string;
  name: string;
  position: 'top' | 'center' | 'bottom' | 'left' | 'right' | 'full';
  flex: number;
  acceptsComponents: string[];
  defaultComponent?: string;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  slots: LayoutSlot[];
  defaultComponents: string[];
}
