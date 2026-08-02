import React from 'react';
import type { ComponentBlueprint, ThemeTokens, ComponentType } from '../blueprint/schema';
import { ButtonPreview, CardPreview } from '../components-library';

// ─── Theme Context ────────────────────────────────────────────────────────────

const ThemeCtx = React.createContext<ThemeTokens | null>(null);

export function usePreviewTheme(): ThemeTokens {
  const theme = React.useContext(ThemeCtx);
  if (!theme) throw new Error('usePreviewTheme must be used inside ThemeProvider');
  return theme;
}

export const ThemeProvider: React.FC<{ theme: ThemeTokens; children: React.ReactNode }> = ({ theme, children }) => (
  <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>
);

// ─── Component Renderer ───────────────────────────────────────────────────────

interface ComponentRendererProps {
  component: ComponentBlueprint;
  depth?: number;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component, depth = 0, onSelect, selectedId }) => {
  const theme = usePreviewTheme();
  const isSelected = selectedId === component.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(component.id);
  };

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    outline: isSelected ? `2px solid ${theme.colors.primary}` : 'none',
    outlineOffset: '1px',
    borderRadius: theme.borderRadius.md,
    cursor: 'default',
    ...toStyleProps(component.style, theme),
  };

  const renderChildren = () => component.children?.map(child => (
    <ComponentRenderer key={child.id} component={child} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />
  ));

  switch (component.type as ComponentType) {
    // ── Layout ──────────────────────────────────────────────────────────────
    case 'Container':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', flexDirection: 'column', gap: 8, padding: component.style?.padding || 12 }}>
          {renderChildren()}
        </div>
      );

    case 'Row':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', flexDirection: 'row', gap: component.props?.gap as number || 8, flexWrap: 'wrap' }}>
          {renderChildren()}
        </div>
      );

    case 'Column':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', flexDirection: 'column', gap: component.props?.gap as number || 8 }}>
          {renderChildren()}
        </div>
      );

    case 'ScrollView':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
          {renderChildren()}
        </div>
      );

    case 'Grid':
      const cols = (component.props?.columns as number) || 2;
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, padding: 8 }}>
          {renderChildren()}
        </div>
      );

    case 'Spacer':
      return <div style={{ height: (component.props?.height as number) || 16, flex: component.style?.flex }} />;

    case 'Divider':
      return <div onClick={handleClick} style={{ height: 1, backgroundColor: theme.colors.divider, margin: '4px 0', ...baseStyle }} />;

    // ── Input ────────────────────────────────────────────────────────────────
    case 'Button':
      return (
        <ButtonPreview
          props={component.props as any}
          theme={theme}
          onClick={handleClick}
          style={baseStyle}
        />
      );

    case 'IconButton':
      return (
        <button onClick={handleClick} style={{ ...baseStyle, width: 36, height: 36, borderRadius: theme.borderRadius.full, background: theme.colors.surfaceVariant, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: 14 }}>⚡</span>
        </button>
      );

    case 'TextField':
    case 'PasswordField':
    case 'SearchBar':
      return (
        <div onClick={handleClick} style={{ ...baseStyle }}>
          {component.label && (
            <label style={{ fontSize: 11, fontWeight: 600, color: theme.colors.onSurface, opacity: 0.6, marginBottom: 4, display: 'block', fontFamily: theme.typography.fontFamily }}>
              {component.label}
            </label>
          )}
          <div style={{
            padding: '10px 12px',
            borderRadius: theme.borderRadius.md,
            border: `1.5px solid ${theme.colors.divider}`,
            background: theme.colors.background,
            color: theme.colors.onBackground,
            fontSize: 12,
            fontFamily: theme.typography.fontFamily,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            {component.type === 'SearchBar' && <span>🔍</span>}
            <span style={{ color: theme.colors.onSurface, opacity: 0.4 }}>
              {(component.props?.placeholder as string) || `Enter ${component.label || ''}...`}
            </span>
          </div>
        </div>
      );

    case 'OTPInput':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', gap: 8, justifyContent: 'center' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              width: 36, height: 44, borderRadius: theme.borderRadius.md, border: `1.5px solid ${i === 0 ? theme.colors.primary : theme.colors.divider}`,
              background: theme.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: theme.colors.onBackground,
            }}>
              {i === 0 ? '4' : ''}
            </div>
          ))}
        </div>
      );

    case 'Switch':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: theme.colors.surface, borderRadius: theme.borderRadius.md }}>
          <span style={{ fontSize: 12, color: theme.colors.onSurface, fontFamily: theme.typography.fontFamily }}>{component.label}</span>
          <div style={{ width: 40, height: 22, borderRadius: 11, background: theme.colors.primary, padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: '#fff' }} />
          </div>
        </div>
      );

    case 'Dropdown':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, padding: '10px 12px', border: `1.5px solid ${theme.colors.divider}`, borderRadius: theme.borderRadius.md, background: theme.colors.background, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: theme.colors.onSurface, opacity: 0.5, fontFamily: theme.typography.fontFamily }}>{component.label || 'Select option'}</span>
          <span style={{ color: theme.colors.onSurface, opacity: 0.4 }}>▾</span>
        </div>
      );

    // ── Display ──────────────────────────────────────────────────────────────
    case 'Heading': {
      const level = (component.props?.level as string) || 'h2';
      const sizeMap: Record<string, number> = { h1: 24, h2: 20, h3: 17, h4: 15 };
      const size = sizeMap[level] || 18;
      return (
        <div onClick={handleClick} style={{ ...baseStyle }}>
          <span style={{ fontSize: size, fontWeight: 700, color: theme.colors.onBackground, fontFamily: theme.typography.fontFamily, letterSpacing: -0.3 }}>
            {component.label || 'Heading'}
          </span>
        </div>
      );
    }

    case 'Text':
    case 'Label':
      return (
        <div onClick={handleClick} style={{ ...baseStyle }}>
          <span style={{ fontSize: 12, color: theme.colors.onSurface, fontFamily: theme.typography.fontFamily, lineHeight: 1.6 }}>
            {component.label || 'Text content here'}
          </span>
        </div>
      );

    case 'Badge':
    case 'Tag':
    case 'Chip':
      return (
        <span onClick={handleClick} style={{ ...baseStyle, display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: theme.borderRadius.full, background: `${theme.colors.primary}20`, color: theme.colors.primary, fontSize: 10, fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
          {component.label || 'Badge'}
        </span>
      );

    case 'Avatar':
      const size = (component.props?.size as number) || 40;
      return (
        <div onClick={handleClick} style={{ ...baseStyle, width: size, height: size, borderRadius: theme.borderRadius.full, background: `${theme.colors.primary}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.primary, fontSize: size * 0.35, fontWeight: 700, flexShrink: 0 }}>
          👤
        </div>
      );

    case 'Image':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surfaceVariant, borderRadius: theme.borderRadius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 80, height: (component.style?.height as number) || 120 }}>
          <span style={{ fontSize: 24, opacity: 0.4 }}>🖼️</span>
        </div>
      );

    case 'Card':
      return (
        <CardPreview
          props={component.props as any}
          theme={theme}
          onClick={handleClick}
          style={baseStyle}
        >
          {renderChildren()}
        </CardPreview>
      );

    case 'ListItem':
    case 'ListTile':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: theme.borderRadius.md, background: `${theme.colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16 }}>📄</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 10, borderRadius: 5, background: theme.colors.surfaceVariant, width: '60%', marginBottom: 4 }} />
            <div style={{ height: 7, borderRadius: 4, background: theme.colors.divider, width: '40%' }} />
          </div>
          <span style={{ color: theme.colors.onSurface, opacity: 0.3, fontSize: 12 }}>›</span>
        </div>
      );

    case 'Skeleton':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 14, borderRadius: 7, background: theme.colors.surfaceVariant, width: '80%' }} />
          <div style={{ height: 10, borderRadius: 5, background: theme.colors.divider, width: '60%' }} />
          <div style={{ height: 10, borderRadius: 5, background: theme.colors.divider, width: '40%' }} />
        </div>
      );

    case 'ProgressBar':
      const progressVal = (component.props?.value as number) || 60;
      return (
        <div onClick={handleClick} style={{ ...baseStyle }}>
          {component.label && <span style={{ fontSize: 10, color: theme.colors.onSurface, opacity: 0.6, display: 'block', marginBottom: 4, fontFamily: theme.typography.fontFamily }}>{component.label}</span>}
          <div style={{ height: 6, borderRadius: 3, background: theme.colors.surfaceVariant }}>
            <div style={{ width: `${progressVal}%`, height: '100%', borderRadius: 3, background: theme.colors.primary }} />
          </div>
        </div>
      );

    case 'Rating':
    case 'RatingStars':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', gap: 3 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ fontSize: 14, color: i < 4 ? '#FFD700' : theme.colors.divider }}>★</span>
          ))}
        </div>
      );

    case 'Price':
    case 'PriceTag':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}>$49.99</span>
          <span style={{ fontSize: 12, color: theme.colors.onSurface, opacity: 0.4, textDecoration: 'line-through' }}>$79.99</span>
        </div>
      );

    // ── Navigation ───────────────────────────────────────────────────────────
    case 'TopBar':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: theme.colors.surface, borderBottom: `1px solid ${theme.colors.divider}` }}>
          {component.props?.showBack && <span style={{ color: theme.colors.onSurface, opacity: 0.7, fontSize: 14 }}>‹</span>}
          {component.props?.showMenu && <span style={{ color: theme.colors.onSurface, opacity: 0.7, fontSize: 14 }}>☰</span>}
          <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: theme.colors.onSurface, fontFamily: theme.typography.fontFamily }}>
            {(component.props?.title as string) || component.label || 'Screen Title'}
          </span>
          {component.props?.showSearch && <span style={{ color: theme.colors.onSurface, opacity: 0.7, fontSize: 14 }}>🔍</span>}
          {component.props?.showNotif && <span style={{ color: theme.colors.onSurface, opacity: 0.7, fontSize: 14 }}>🔔</span>}
          {component.props?.showCart && <span style={{ color: theme.colors.onSurface, opacity: 0.7, fontSize: 14 }}>🛒</span>}
        </div>
      );

    case 'BottomNav':
      const tabs = (component.props?.tabs as string[]) || ['Home', 'Search', 'Orders', 'Profile'];
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', borderTop: `1px solid ${theme.colors.divider}`, background: theme.colors.surface, padding: '8px 0 4px' }}>
          {tabs.map((tab, i) => (
            <div key={tab} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '2px 0' }}>
              <div style={{ width: 20, height: 20, borderRadius: theme.borderRadius.md, background: i === 0 ? theme.colors.primary : theme.colors.surfaceVariant, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10 }}>{['🏠', '🔍', '📦', '👤'][i] || '●'}</span>
              </div>
              <span style={{ fontSize: 9, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? theme.colors.primary : theme.colors.onSurface, opacity: i === 0 ? 1 : 0.5, fontFamily: theme.typography.fontFamily }}>
                {tab}
              </span>
            </div>
          ))}
        </div>
      );

    // ── Data / Charts ─────────────────────────────────────────────────────────
    case 'StatCard':
    case 'KPICard':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: theme.colors.onSurface, opacity: 0.5, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: theme.typography.fontFamily }}>
            {component.label || 'Metric'}
          </span>
          <span style={{ fontSize: 22, fontWeight: 700, color: theme.colors.onBackground, fontFamily: theme.typography.fontFamily }}>1,248</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 10, color: theme.colors.success, fontWeight: 600 }}>↑ 12%</span>
            <span style={{ fontSize: 9, color: theme.colors.onSurface, opacity: 0.4 }}>vs last month</span>
          </div>
        </div>
      );

    case 'LineChart':
    case 'BarChart':
    case 'Chart': {
      const isBar = component.type === 'BarChart';
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 12 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: theme.colors.onSurface, opacity: 0.6, display: 'block', marginBottom: 8, fontFamily: theme.typography.fontFamily }}>
            {component.label || (isBar ? 'Bar Chart' : 'Line Chart')}
          </span>
          <svg viewBox="0 0 200 80" style={{ width: '100%', height: 60 }}>
            {isBar ? (
              [30, 55, 40, 70, 50, 65, 45].map((h, i) => (
                <rect key={i} x={i * 26 + 5} y={80 - h} width={18} height={h} rx={3} fill={theme.colors.primary} opacity={i === 3 ? 1 : 0.5} />
              ))
            ) : (
              <polyline
                points="0,70 30,50 60,60 90,30 120,45 150,20 200,35"
                fill="none"
                stroke={theme.colors.primary}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>
      );
    }

    case 'PieChart':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg viewBox="0 0 80 80" style={{ width: 60, height: 60, flexShrink: 0 }}>
            <circle cx="40" cy="40" r="30" fill="none" stroke={theme.colors.primary} strokeWidth="12" strokeDasharray="94 188" />
            <circle cx="40" cy="40" r="30" fill="none" stroke={theme.colors.secondary} strokeWidth="12" strokeDasharray="62 188" strokeDashoffset="-94" />
            <circle cx="40" cy="40" r="30" fill="none" stroke={theme.colors.accent} strokeWidth="12" strokeDasharray="32 188" strokeDashoffset="-156" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[['Primary', theme.colors.primary], ['Secondary', theme.colors.secondary], ['Other', theme.colors.accent]].map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
                <span style={{ fontSize: 9, color: theme.colors.onSurface, opacity: 0.7, fontFamily: theme.typography.fontFamily }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'Table':
    case 'DataGrid':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.md, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${theme.colors.divider}`, padding: '6px 10px', background: theme.colors.surfaceVariant }}>
            {['Name', 'Status', 'Date'].map(h => (
              <span key={h} style={{ fontSize: 9, fontWeight: 700, color: theme.colors.onSurface, opacity: 0.6, fontFamily: theme.typography.fontFamily }}>{h}</span>
            ))}
          </div>
          {[1, 2, 3].map(row => (
            <div key={row} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '6px 10px', borderBottom: `1px solid ${theme.colors.divider}20` }}>
              <div style={{ height: 8, borderRadius: 4, background: theme.colors.surfaceVariant, width: '80%' }} />
              <div style={{ height: 8, borderRadius: 8, background: `${theme.colors.success}30`, width: 40 }} />
              <div style={{ height: 8, borderRadius: 4, background: theme.colors.surfaceVariant, width: '70%' }} />
            </div>
          ))}
        </div>
      );

    // ── Commerce ─────────────────────────────────────────────────────────────
    case 'ProductCard':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.xl, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 80, background: theme.colors.surfaceVariant, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 24 }}>📦</span>
          </div>
          <div style={{ padding: 10 }}>
            <div style={{ height: 9, borderRadius: 5, background: theme.colors.surfaceVariant, width: '80%', marginBottom: 5 }} />
            <div style={{ height: 7, borderRadius: 4, background: theme.colors.divider, width: '50%', marginBottom: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}>$29</span>
              <div style={{ width: 24, height: 24, borderRadius: theme.borderRadius.md, background: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 12, color: '#fff' }}>+</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'CartItem':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 50, height: 50, borderRadius: theme.borderRadius.md, background: theme.colors.surfaceVariant, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>📦</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 9, borderRadius: 5, background: theme.colors.surfaceVariant, width: '70%', marginBottom: 4 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}>$29.99</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: theme.colors.surfaceVariant, borderRadius: theme.borderRadius.md, padding: '4px 8px' }}>
            <span style={{ color: theme.colors.onSurface, opacity: 0.6, fontSize: 14 }}>−</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.onSurface, fontFamily: theme.typography.fontFamily }}>1</span>
            <span style={{ color: theme.colors.onSurface, opacity: 0.6, fontSize: 14 }}>+</span>
          </div>
        </div>
      );

    case 'OrderSummary':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 14 }}>
          {[['Subtotal', '$89.97'], ['Delivery', '$4.99'], ['Discount', '-$10.00']].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: theme.colors.onSurface, opacity: 0.6, fontFamily: theme.typography.fontFamily }}>{label}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.onSurface, fontFamily: theme.typography.fontFamily }}>{value}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${theme.colors.divider}`, marginTop: 6, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.onBackground, fontFamily: theme.typography.fontFamily }}>Total</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: theme.colors.primary, fontFamily: theme.typography.fontFamily }}>$84.96</span>
          </div>
        </div>
      );

    // ── Communication ──────────────────────────────────────────────────────────
    case 'ChatBubble':
    case 'MessageList': {
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { own: false, text: 'Hey, when is the appointment?' },
            { own: true, text: 'Tomorrow at 2pm, confirm?' },
            { own: false, text: 'Yes, confirmed! See you then 👍' },
          ].map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.own ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '7px 10px', borderRadius: msg.own ? `${theme.borderRadius.xl}px ${theme.borderRadius.xl}px 4px ${theme.borderRadius.xl}px` : `${theme.borderRadius.xl}px ${theme.borderRadius.xl}px ${theme.borderRadius.xl}px 4px`,
                background: msg.own ? theme.colors.primary : theme.colors.surface,
                color: msg.own ? theme.colors.onPrimary : theme.colors.onSurface,
                fontSize: 11, fontFamily: theme.typography.fontFamily,
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'ChatInput':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: theme.colors.surface, borderTop: `1px solid ${theme.colors.divider}` }}>
          <div style={{ flex: 1, padding: '8px 12px', background: theme.colors.background, borderRadius: theme.borderRadius.full, fontSize: 12, color: theme.colors.onSurface, opacity: 0.4, fontFamily: theme.typography.fontFamily }}>
            Type a message...
          </div>
          <div style={{ width: 32, height: 32, borderRadius: theme.borderRadius.full, background: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, color: '#fff' }}>➤</span>
          </div>
        </div>
      );

    case 'NotificationCard':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10, borderLeft: `3px solid ${theme.colors.primary}` }}>
          <div style={{ width: 32, height: 32, borderRadius: theme.borderRadius.full, background: `${theme.colors.primary}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            🔔
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 9, borderRadius: 5, background: theme.colors.surfaceVariant, width: '70%', marginBottom: 4 }} />
            <div style={{ height: 7, borderRadius: 4, background: theme.colors.divider, width: '90%', marginBottom: 4 }} />
            <span style={{ fontSize: 9, color: theme.colors.onSurface, opacity: 0.4, fontFamily: theme.typography.fontFamily }}>2 minutes ago</span>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: theme.colors.primary, flexShrink: 0, marginTop: 4 }} />
        </div>
      );

    // ── Map / Calendar ────────────────────────────────────────────────────────
    case 'MapView':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: '#1a2f1a', borderRadius: theme.borderRadius.xl, minHeight: 120, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(100,200,100,0.1) 20px, rgba(100,200,100,0.1) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(100,200,100,0.1) 20px, rgba(100,200,100,0.1) 21px)' }} />
          <div style={{ width: 24, height: 24, borderRadius: theme.borderRadius.full, background: theme.colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, boxShadow: `0 0 0 8px ${theme.colors.primary}30` }}>
            <span style={{ fontSize: 14 }}>📍</span>
          </div>
        </div>
      );

    case 'Calendar':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.onBackground, fontFamily: theme.typography.fontFamily }}>August 2026</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: theme.colors.onSurface, opacity: 0.4 }}>‹</span>
              <span style={{ color: theme.colors.onSurface, opacity: 0.4 }}>›</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {['S','M','T','W','T','F','S'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 8, fontWeight: 700, color: theme.colors.onSurface, opacity: 0.4, fontFamily: theme.typography.fontFamily, paddingBottom: 4 }}>{d}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <div key={day} style={{
                textAlign: 'center', fontSize: 9, padding: '3px 0', borderRadius: theme.borderRadius.full,
                background: day === 1 ? theme.colors.primary : day === 15 ? `${theme.colors.secondary}30` : 'transparent',
                color: day === 1 ? '#fff' : day === 15 ? theme.colors.secondary : theme.colors.onSurface,
                fontFamily: theme.typography.fontFamily, fontWeight: day === 1 ? 700 : 400,
              }}>
                {day}
              </div>
            ))}
          </div>
        </div>
      );

    case 'AppointmentCard':
    case 'EventCard':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 12, display: 'flex', gap: 10, borderLeft: `3px solid ${theme.colors.primary}` }}>
          <div style={{ width: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: theme.colors.onSurface, opacity: 0.5 }}>AUG</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.colors.onBackground, lineHeight: 1.1, fontFamily: theme.typography.fontFamily }}>15</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 9, borderRadius: 5, background: theme.colors.surfaceVariant, width: '70%', marginBottom: 4 }} />
            <div style={{ height: 7, borderRadius: 4, background: theme.colors.divider, width: '50%', marginBottom: 6 }} />
            <span style={{ fontSize: 9, color: theme.colors.primary, background: `${theme.colors.primary}15`, padding: '2px 8px', borderRadius: theme.borderRadius.full, fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>Confirmed</span>
          </div>
        </div>
      );

    // ── Feedback ──────────────────────────────────────────────────────────────
    case 'Toast':
    case 'SnackBar':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: theme.elevation.lg }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{ flex: 1, fontSize: 11, color: theme.colors.onSurface, fontFamily: theme.typography.fontFamily }}>{component.label || 'Action completed successfully'}</span>
          <span style={{ fontSize: 10, color: theme.colors.primary, fontWeight: 700, fontFamily: theme.typography.fontFamily }}>Undo</span>
        </div>
      );

    case 'LoadingSpinner':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${theme.colors.divider}`, borderTopColor: theme.colors.primary, borderRadius: '50%' }} />
        </div>
      );

    case 'EmptyState':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 }}>
          <span style={{ fontSize: 32 }}>📭</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.onBackground, fontFamily: theme.typography.fontFamily }}>No Data Yet</span>
          <span style={{ fontSize: 11, color: theme.colors.onSurface, opacity: 0.5, fontFamily: theme.typography.fontFamily, textAlign: 'center' }}>Items will appear here once available</span>
        </div>
      );

    case 'BottomSheet':
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surface, borderRadius: `${theme.borderRadius.xxl}px ${theme.borderRadius.xxl}px 0 0`, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: theme.colors.divider, alignSelf: 'center', marginBottom: 4 }} />
          {renderChildren() || (
            <>
              <div style={{ height: 10, borderRadius: 5, background: theme.colors.surfaceVariant, width: '50%', alignSelf: 'center' }} />
              <div style={{ height: 8, borderRadius: 4, background: theme.colors.divider, width: '80%' }} />
              <div style={{ height: 8, borderRadius: 4, background: theme.colors.divider, width: '70%' }} />
            </>
          )}
        </div>
      );

    // ── Auth ─────────────────────────────────────────────────────────────────
    case 'SocialAuthButton':
      const provider = (component.props?.provider as string) || 'google';
      const providerColors: Record<string, { bg: string; icon: string; label: string }> = {
        google: { bg: '#fff', icon: '🇬', label: 'Continue with Google' },
        facebook: { bg: '#1877F2', icon: '📘', label: 'Continue with Facebook' },
        apple: { bg: '#000', icon: '🍎', label: 'Continue with Apple' },
        github: { bg: '#24292e', icon: '🐙', label: 'Continue with GitHub' },
      };
      const pStyle = providerColors[provider] || providerColors.google;
      return (
        <button onClick={handleClick} style={{ ...baseStyle, background: pStyle.bg, border: `1px solid ${theme.colors.divider}`, borderRadius: theme.borderRadius.lg, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', cursor: 'pointer' }}>
          <span>{pStyle.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: pStyle.bg === '#fff' ? '#333' : '#fff', fontFamily: theme.typography.fontFamily }}>{pStyle.label}</span>
        </button>
      );

    // ── Default fallback ──────────────────────────────────────────────────────
    default:
      return (
        <div onClick={handleClick} style={{ ...baseStyle, background: theme.colors.surfaceVariant, borderRadius: theme.borderRadius.md, padding: 10, border: `1px dashed ${theme.colors.divider}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12 }}>🧩</span>
          <span style={{ fontSize: 10, color: theme.colors.onSurface, opacity: 0.6, fontFamily: theme.typography.fontFamily }}>
            {component.type}: {component.label || ''}
          </span>
        </div>
      );
  }
};

// ─── Style Helpers ────────────────────────────────────────────────────────────

function toStyleProps(style?: ComponentBlueprint['style'], _theme?: ThemeTokens): React.CSSProperties {
  if (!style) return {};
  return {
    width: style.width,
    height: style.height,
    flex: style.flex,
    alignSelf: style.alignSelf as any,
    backgroundColor: style.backgroundColor,
    margin: style.margin,
    padding: style.padding,
  };
}
