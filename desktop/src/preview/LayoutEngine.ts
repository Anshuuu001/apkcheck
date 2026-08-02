import type { ScreenBlueprint, ComponentBlueprint } from '../blueprint/schema';

export interface LayoutSection {
  role: 'header' | 'body' | 'footer' | 'sidebar' | 'grid';
  components: ComponentBlueprint[];
  style?: React.CSSProperties;
}

export interface RenderLayoutTree {
  layoutType: 'dashboard' | 'list' | 'split' | 'form' | 'stack';
  sections: LayoutSection[];
  containerStyle: React.CSSProperties;
}

/**
 * Parses a screen blueprint and partitions components into structured layout sections
 * depending on the screen's layout metadata.
 */
export function buildLayoutTree(screen: ScreenBlueprint): RenderLayoutTree {
  // Determine layout type from route/type, or default to stack layout
  let layoutType: RenderLayoutTree['layoutType'] = 'stack';
  
  if (screen.type === 'dashboard') {
    layoutType = 'dashboard';
  } else if (screen.type === 'list' || screen.type === 'search') {
    layoutType = 'list';
  } else if (screen.type === 'form' || screen.type === 'auth') {
    layoutType = 'form';
  } else if (screen.type === 'report' || screen.type === 'custom') {
    layoutType = 'split';
  }

  const components = screen.components || [];

  // 1. Separate navigation components (headers, bottom-tabs)
  const headerComp = components.find(c => c.type === 'TopBar');
  const footerComp = components.find(c => c.type === 'BottomNav' || c.type === 'FAB');
  const remaining = components.filter(c => c !== headerComp && c !== footerComp);

  const sections: LayoutSection[] = [];

  // Header section
  if (headerComp) {
    sections.push({
      role: 'header',
      components: [headerComp],
      style: { flexShrink: 0 }
    });
  }

  // Sidebar (specific to split layout)
  if (layoutType === 'split') {
    const sidebarComps = remaining.filter(c => c.type === 'Card' || c.type === 'ListTile');
    const bodyComps = remaining.filter(c => !sidebarComps.includes(c));

    sections.push({
      role: 'sidebar',
      components: sidebarComps,
      style: { width: '30%', borderRight: '1px solid rgba(255,255,255,0.08)', overflowY: 'auto' }
    });

    sections.push({
      role: 'body',
      components: bodyComps,
      style: { flex: 1, overflowY: 'auto', padding: 12 }
    });
  }
  // Dashboard layout grid
  else if (layoutType === 'dashboard') {
    const kpis = remaining.filter(c => c.type === 'StatCard' || c.type === 'KPICard' || c.type === 'Row');
    const rest = remaining.filter(c => !kpis.includes(c));

    if (kpis.length > 0) {
      sections.push({
        role: 'grid',
        components: kpis,
        style: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, padding: 12 }
      });
    }

    sections.push({
      role: 'body',
      components: rest,
      style: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }
    });
  }
  // General stack/list/form scroll view
  else {
    sections.push({
      role: 'body',
      components: remaining,
      style: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: layoutType === 'form' ? 14 : 8,
        padding: 16
      }
    });
  }

  // Footer section
  if (footerComp) {
    sections.push({
      role: 'footer',
      components: [footerComp],
      style: { flexShrink: 0 }
    });
  }

  // Master container styling
  const containerStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: layoutType === 'split' ? 'row' : 'column',
    overflow: 'hidden',
  };

  return {
    layoutType,
    sections,
    containerStyle,
  };
}
